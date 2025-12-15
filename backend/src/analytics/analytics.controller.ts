import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

/**
 * 📊 Analytics API Endpoints
 * 
 * Dashboard and metrics endpoints for admin panel
 */
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    /**
     * Get dashboard summary
     */
    @Get('dashboard')
    getDashboard() {
        return this.analyticsService.getDashboardSummary();
    }

    /**
     * Get DAU for a specific date
     */
    @Get('dau/:date')
    getDAU(@Param('date') date: string) {
        return { date, dau: this.analyticsService.getDAU(date) };
    }

    /**
     * Get MAU (Monthly Active Users)
     */
    @Get('mau')
    getMAU() {
        return { mau: this.analyticsService.getMAU() };
    }

    /**
     * Get retention cohort
     */
    @Get('retention/:cohortDate')
    getRetention(
        @Param('cohortDate') cohortDate: string,
        @Query('days') days: string = '1,7,14,30',
    ) {
        const daysArray = days.split(',').map(d => parseInt(d));
        return this.analyticsService.getRetentionCohort(cohortDate, daysArray);
    }

    /**
     * Get economy summary
     */
    @Get('economy')
    getEconomy(
        @Query('start') startDate: string,
        @Query('end') endDate: string,
    ) {
        const today = new Date().toISOString().split('T')[0];
        return this.analyticsService.getEconomySummary(
            startDate || today,
            endDate || today,
        );
    }

    /**
     * Get user analytics
     */
    @Get('user/:userId')
    getUserAnalytics(@Param('userId') userId: string) {
        const metrics = this.analyticsService.getUserAnalytics(userId);
        if (!metrics) {
            return { error: 'User not found' };
        }
        return metrics;
    }

    /**
     * Get leaderboard
     */
    @Get('leaderboard/:metric')
    getLeaderboard(
        @Param('metric') metric: 'totalEarned' | 'totalPlayTime' | 'referralCount',
        @Query('limit') limit: string = '10',
    ) {
        return this.analyticsService.getLeaderboard(metric, parseInt(limit));
    }

    /**
     * Track event (webhook from game servers)
     */
    @Post('track')
    trackEvent(
        @Body() body: { userId: string; eventName: string; properties?: Record<string, any> },
    ) {
        this.analyticsService.track(
            body.userId,
            body.eventName,
            body.properties || {},
        );
        return { success: true };
    }

    /**
     * Start session
     */
    @Post('session/start')
    startSession(@Body() body: { userId: string }) {
        const sessionId = this.analyticsService.startSession(body.userId);
        return { sessionId };
    }

    /**
     * End session
     */
    @Post('session/end')
    endSession(@Body() body: { userId: string }) {
        const session = this.analyticsService.endSession(body.userId);
        return { session };
    }
}
