import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 📊 Analytics Dashboard Service
 * 
 * Tracks player behavior, engagement, and economy metrics.
 * Can integrate with Mixpanel, Amplitude, or custom storage.
 * 
 * Key Metrics:
 * - DAU/MAU/WAU
 * - Session length
 * - Retention cohorts
 * - Economy flow (earn/spend/burn)
 * - Feature adoption
 */

export interface AnalyticsEvent {
    userId: string;
    eventName: string;
    properties: Record<string, any>;
    timestamp: Date;
    sessionId?: string;
}

export interface SessionData {
    userId: string;
    sessionId: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    eventsCount: number;
    actions: string[];
}

export interface UserMetrics {
    userId: string;
    firstSeen: Date;
    lastSeen: Date;
    totalSessions: number;
    totalPlayTime: number; // seconds
    totalEarned: number;   // AURA
    totalSpent: number;    // AURA
    totalBurned: number;   // AURA
    referralCount: number;
    premiumPurchases: number;
}

export interface DailyMetrics {
    date: string;
    dau: number;
    newUsers: number;
    sessions: number;
    avgSessionLength: number;
    totalEarnings: number;
    totalSpending: number;
    totalBurns: number;
    premiumConversions: number;
}

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    // In-memory storage (production: use Redis/MongoDB/TimescaleDB)
    private events: AnalyticsEvent[] = [];
    private sessions: Map<string, SessionData> = new Map();
    private userMetrics: Map<string, UserMetrics> = new Map();
    private dailyMetrics: Map<string, DailyMetrics> = new Map();

    // Active sessions tracking
    private activeSessions: Map<string, string> = new Map(); // userId -> sessionId

    constructor(private readonly configService: ConfigService) {
        this.logger.log('📊 Analytics Dashboard initialized');
    }

    // === Event Tracking ===

    /**
     * Track a generic event
     */
    track(userId: string, eventName: string, properties: Record<string, any> = {}) {
        const event: AnalyticsEvent = {
            userId,
            eventName,
            properties,
            timestamp: new Date(),
            sessionId: this.activeSessions.get(userId),
        };

        this.events.push(event);
        this._updateSessionEvents(userId, eventName);
        this._updateDailyMetrics(eventName, properties);

        this.logger.debug(`Track: ${userId} - ${eventName}`);
    }

    /**
     * Track user session start
     */
    startSession(userId: string): string {
        const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const session: SessionData = {
            userId,
            sessionId,
            startTime: new Date(),
            eventsCount: 0,
            actions: [],
        };

        this.sessions.set(sessionId, session);
        this.activeSessions.set(userId, sessionId);

        // Update user metrics
        this._ensureUserMetrics(userId);
        const metrics = this.userMetrics.get(userId)!;
        metrics.totalSessions++;
        metrics.lastSeen = new Date();

        this.track(userId, 'session_start', { sessionId });

        return sessionId;
    }

    /**
     * Track user session end
     */
    endSession(userId: string): SessionData | null {
        const sessionId = this.activeSessions.get(userId);
        if (!sessionId) return null;

        const session = this.sessions.get(sessionId);
        if (!session) return null;

        session.endTime = new Date();
        session.duration = Math.floor(
            (session.endTime.getTime() - session.startTime.getTime()) / 1000
        );

        // Update user metrics
        const metrics = this.userMetrics.get(userId);
        if (metrics) {
            metrics.totalPlayTime += session.duration;
        }

        this.activeSessions.delete(userId);
        this.track(userId, 'session_end', {
            sessionId,
            duration: session.duration
        });

        return session;
    }

    // === Economy Tracking ===

    /**
     * Track AURA earned
     */
    trackEarning(userId: string, amount: number, source: string) {
        this._ensureUserMetrics(userId);
        const metrics = this.userMetrics.get(userId)!;
        metrics.totalEarned += amount;

        this.track(userId, 'aura_earned', { amount, source });
        this._updateDailyEconomyMetrics('earnings', amount);
    }

    /**
     * Track AURA spent
     */
    trackSpending(userId: string, amount: number, item: string) {
        this._ensureUserMetrics(userId);
        const metrics = this.userMetrics.get(userId)!;
        metrics.totalSpent += amount;

        this.track(userId, 'aura_spent', { amount, item });
        this._updateDailyEconomyMetrics('spending', amount);
    }

    /**
     * Track AURA burned
     */
    trackBurn(userId: string, amount: number, category: string) {
        this._ensureUserMetrics(userId);
        const metrics = this.userMetrics.get(userId)!;
        metrics.totalBurned += amount;

        this.track(userId, 'aura_burned', { amount, category });
        this._updateDailyEconomyMetrics('burns', amount);
    }

    // === Feature Tracking ===

    /**
     * Track crystal claim
     */
    trackCrystalClaim(userId: string, crystalId: string, rarity: string, value: number) {
        this.track(userId, 'crystal_claimed', { crystalId, rarity, value });
    }

    /**
     * Track NFT transaction
     */
    trackNFTTransaction(userId: string, type: 'mint' | 'buy' | 'sell' | 'auction', nftId: string, price: number) {
        this.track(userId, 'nft_transaction', { type, nftId, price });
    }

    /**
     * Track Battle Pass activity
     */
    trackBattlePass(userId: string, action: 'purchase' | 'tier_up' | 'claim_reward', tier?: number) {
        this.track(userId, 'battle_pass', { action, tier });

        if (action === 'purchase') {
            const metrics = this.userMetrics.get(userId);
            if (metrics) metrics.premiumPurchases++;
        }
    }

    /**
     * Track PvP activity
     */
    trackPvP(userId: string, result: 'win' | 'loss', opponentId: string, wager: number) {
        this.track(userId, 'pvp_duel', { result, opponentId, wager });
    }

    /**
     * Track referral
     */
    trackReferral(referrerId: string, refereeId: string) {
        this._ensureUserMetrics(referrerId);
        const metrics = this.userMetrics.get(referrerId)!;
        metrics.referralCount++;

        this.track(referrerId, 'referral_success', { refereeId });
    }

    // === Analytics Queries ===

    /**
     * Get DAU for a specific date
     */
    getDAU(date: string): number {
        const daily = this.dailyMetrics.get(date);
        return daily?.dau || 0;
    }

    /**
     * Get MAU (last 30 days)
     */
    getMAU(): number {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const uniqueUsers = new Set<string>();
        for (const event of this.events) {
            if (event.timestamp >= thirtyDaysAgo) {
                uniqueUsers.add(event.userId);
            }
        }

        return uniqueUsers.size;
    }

    /**
     * Get user retention for cohort
     */
    getRetentionCohort(cohortDate: string, days: number[]): Record<number, number> {
        // Simplified retention calculation
        const cohortUsers = Array.from(this.userMetrics.values())
            .filter(u => u.firstSeen.toISOString().startsWith(cohortDate));

        const retention: Record<number, number> = {};
        const cohortSize = cohortUsers.length;

        for (const day of days) {
            const targetDate = new Date(cohortDate);
            targetDate.setDate(targetDate.getDate() + day);
            const targetDateStr = targetDate.toISOString().split('T')[0];

            const daily = this.dailyMetrics.get(targetDateStr);
            if (daily && cohortSize > 0) {
                // Simplified: use DAU ratio as proxy
                retention[day] = Math.round((daily.dau / cohortSize) * 100);
            } else {
                retention[day] = 0;
            }
        }

        return retention;
    }

    /**
     * Get economy summary
     */
    getEconomySummary(startDate: string, endDate: string): {
        totalEarned: number;
        totalSpent: number;
        totalBurned: number;
        netFlow: number;
    } {
        let totalEarned = 0;
        let totalSpent = 0;
        let totalBurned = 0;

        for (const [date, metrics] of this.dailyMetrics) {
            if (date >= startDate && date <= endDate) {
                totalEarned += metrics.totalEarnings;
                totalSpent += metrics.totalSpending;
                totalBurned += metrics.totalBurns;
            }
        }

        return {
            totalEarned,
            totalSpent,
            totalBurned,
            netFlow: totalEarned - totalSpent - totalBurned,
        };
    }

    /**
     * Get user profile for analytics
     */
    getUserAnalytics(userId: string): UserMetrics | null {
        return this.userMetrics.get(userId) || null;
    }

    /**
     * Get top users by metric
     */
    getLeaderboard(metric: 'totalEarned' | 'totalPlayTime' | 'referralCount', limit: number = 10): UserMetrics[] {
        return Array.from(this.userMetrics.values())
            .sort((a, b) => (b[metric] as number) - (a[metric] as number))
            .slice(0, limit);
    }

    /**
     * Get dashboard summary
     */
    getDashboardSummary(): {
        dau: number;
        mau: number;
        avgSessionLength: number;
        topEvents: Array<{ name: string; count: number }>;
        economyHealth: string;
    } {
        const today = new Date().toISOString().split('T')[0];
        const todayMetrics = this.dailyMetrics.get(today);

        // Count events by name
        const eventCounts = new Map<string, number>();
        for (const event of this.events) {
            const count = eventCounts.get(event.eventName) || 0;
            eventCounts.set(event.eventName, count + 1);
        }

        const topEvents = Array.from(eventCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const economy = this.getEconomySummary(today, today);
        const burnRatio = economy.totalEarned > 0
            ? (economy.totalBurned / economy.totalEarned) * 100
            : 0;

        return {
            dau: todayMetrics?.dau || 0,
            mau: this.getMAU(),
            avgSessionLength: todayMetrics?.avgSessionLength || 0,
            topEvents,
            economyHealth: burnRatio > 50 ? 'Deflationary ✅' : 'Inflationary ⚠️',
        };
    }

    // === Internal Helpers ===

    private _ensureUserMetrics(userId: string) {
        if (!this.userMetrics.has(userId)) {
            this.userMetrics.set(userId, {
                userId,
                firstSeen: new Date(),
                lastSeen: new Date(),
                totalSessions: 0,
                totalPlayTime: 0,
                totalEarned: 0,
                totalSpent: 0,
                totalBurned: 0,
                referralCount: 0,
                premiumPurchases: 0,
            });
        }
    }

    private _updateSessionEvents(userId: string, eventName: string) {
        const sessionId = this.activeSessions.get(userId);
        if (sessionId) {
            const session = this.sessions.get(sessionId);
            if (session) {
                session.eventsCount++;
                session.actions.push(eventName);
            }
        }
    }

    private _updateDailyMetrics(eventName: string, properties: Record<string, any>) {
        const today = new Date().toISOString().split('T')[0];

        if (!this.dailyMetrics.has(today)) {
            this.dailyMetrics.set(today, {
                date: today,
                dau: 0,
                newUsers: 0,
                sessions: 0,
                avgSessionLength: 0,
                totalEarnings: 0,
                totalSpending: 0,
                totalBurns: 0,
                premiumConversions: 0,
            });
        }

        const metrics = this.dailyMetrics.get(today)!;

        if (eventName === 'session_start') {
            metrics.sessions++;
        }
    }

    private _updateDailyEconomyMetrics(type: 'earnings' | 'spending' | 'burns', amount: number) {
        const today = new Date().toISOString().split('T')[0];

        if (!this.dailyMetrics.has(today)) {
            this._updateDailyMetrics('', {});
        }

        const metrics = this.dailyMetrics.get(today)!;

        switch (type) {
            case 'earnings':
                metrics.totalEarnings += amount;
                break;
            case 'spending':
                metrics.totalSpending += amount;
                break;
            case 'burns':
                metrics.totalBurns += amount;
                break;
        }
    }
}
