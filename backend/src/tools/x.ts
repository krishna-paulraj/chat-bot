/**
 * X (Twitter) MCP Tool
 * Provides functionality to post and retrieve tweets using Twitter API v2
 */

import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface Tweet {
    id: string;
    text: string;
    author: string;
    created_at: string;
    likes: number;
    retweets: number;
    replies: number;
}

export interface PostTweetRequest {
    text: string;
    reply_to?: string; // Tweet ID to reply to
}

export interface PostTweetResult {
    success: boolean;
    tweet_id: string;
    text: string;
    created_at: string;
    message: string;
}

export interface GetTweetRequest {
    tweet_id?: string;
    username?: string;
    limit?: number;
    search_query?: string;
}

export interface GetTweetResult {
    tweets: Tweet[];
    count: number;
    message: string;
}

export class XService {
    private static client: TwitterApi | null = null;

    /**
     * Initialize Twitter API client
     */
    private static getClient(): TwitterApi {
        if (!this.client) {
            const apiKey = process.env.X_API_KEY;
            const apiSecret = process.env.X_API_SECRET;
            const accessToken = process.env.X_ACCESS_TOKEN;
            const accessSecret = process.env.X_ACCESS_TOKEN_SECRET;

            if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
                throw new Error('Twitter API credentials not configured. Please set TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, and TWITTER_ACCESS_SECRET in your .env file.');
            }

            this.client = new TwitterApi({
                appKey: apiKey,
                appSecret: apiSecret,
                accessToken: accessToken,
                accessSecret: accessSecret,
            });
        }
        return this.client;
    }

    /**
     * Post a new tweet using Twitter API v2
     */
    static async postTweet(request: PostTweetRequest): Promise<PostTweetResult> {
        try {
            // Validate tweet text
            if (!request.text || request.text.trim().length === 0) {
                throw new Error('Tweet text cannot be empty');
            }

            if (request.text.length > 280) {
                throw new Error('Tweet text cannot exceed 280 characters');
            }

            const client = this.getClient();

            // Prepare tweet parameters
            const tweetParams: any = {
                text: request.text
            };

            // Add reply parameter if specified
            if (request.reply_to) {
                tweetParams.reply = {
                    in_reply_to_tweet_id: request.reply_to
                };
            }

            // Post tweet using Twitter API v2
            const tweet = await client.v2.tweet(tweetParams);

            return {
                success: true,
                tweet_id: tweet.data.id,
                text: request.text,
                created_at: new Date().toISOString(),
                message: 'Tweet posted successfully to Twitter'
            };
        } catch (error) {
            console.error('Twitter API Error:', error);
            throw new Error(`Failed to post tweet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get tweets by various criteria using Twitter API v2
     */
    static async getTweets(request: GetTweetRequest): Promise<GetTweetResult> {
        try {
            const client = this.getClient();
            let tweets: Tweet[] = [];

            if (request.tweet_id) {
                // Get specific tweet by ID
                const tweet = await client.v2.singleTweet(request.tweet_id, {
                    'tweet.fields': ['created_at', 'public_metrics', 'author_id']
                });

                if (tweet.data) {
                    tweets = [{
                        id: tweet.data.id,
                        text: tweet.data.text,
                        author: tweet.data.author_id || 'unknown',
                        created_at: tweet.data.created_at || new Date().toISOString(),
                        likes: tweet.data.public_metrics?.like_count || 0,
                        retweets: tweet.data.public_metrics?.retweet_count || 0,
                        replies: tweet.data.public_metrics?.reply_count || 0
                    }];
                }
            } else if (request.username) {
                // Get user ID first, then their tweets
                const user = await client.v2.userByUsername(request.username);
                if (user.data) {
                    const userTweets = await client.v2.userTimeline(user.data.id, {
                        'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
                        max_results: request.limit || 10
                    });

                    tweets = userTweets.data.data?.map(tweet => ({
                        id: tweet.id,
                        text: tweet.text,
                        author: tweet.author_id || 'unknown',
                        created_at: tweet.created_at || new Date().toISOString(),
                        likes: tweet.public_metrics?.like_count || 0,
                        retweets: tweet.public_metrics?.retweet_count || 0,
                        replies: tweet.public_metrics?.reply_count || 0
                    })) || [];
                }
            } else if (request.search_query) {
                // Search tweets
                const searchResults = await client.v2.search(request.search_query, {
                    'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
                    max_results: request.limit || 10
                });

                tweets = searchResults.data.data?.map(tweet => ({
                    id: tweet.id,
                    text: tweet.text,
                    author: tweet.author_id || 'unknown',
                    created_at: tweet.created_at || new Date().toISOString(),
                    likes: tweet.public_metrics?.like_count || 0,
                    retweets: tweet.public_metrics?.retweet_count || 0,
                    replies: tweet.public_metrics?.reply_count || 0
                })) || [];
            } else {
                // Get recent tweets from authenticated user
                const me = await client.v2.me();
                const userTweets = await client.v2.userTimeline(me.data.id, {
                    'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
                    max_results: request.limit || 10
                });

                tweets = userTweets.data.data?.map(tweet => ({
                    id: tweet.id,
                    text: tweet.text,
                    author: tweet.author_id || 'unknown',
                    created_at: tweet.created_at || new Date().toISOString(),
                    likes: tweet.public_metrics?.like_count || 0,
                    retweets: tweet.public_metrics?.retweet_count || 0,
                    replies: tweet.public_metrics?.reply_count || 0
                })) || [];
            }

            return {
                tweets,
                count: tweets.length,
                message: `Retrieved ${tweets.length} tweet(s) from Twitter`
            };
        } catch (error) {
            console.error('Twitter API Error:', error);
            throw new Error(`Failed to retrieve tweets: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Like a tweet using Twitter API v2
     */
    static async likeTweet(tweetId: string): Promise<{ success: boolean; message: string }> {
        try {
            const client = this.getClient();
            const me = await client.v2.me();

            await client.v2.like(me.data.id, tweetId);

            return {
                success: true,
                message: `Tweet ${tweetId} liked successfully on Twitter`
            };
        } catch (error) {
            console.error('Twitter API Error:', error);
            throw new Error(`Failed to like tweet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Retweet a tweet using Twitter API v2
     */
    static async retweet(tweetId: string): Promise<{ success: boolean; message: string }> {
        try {
            const client = this.getClient();
            const me = await client.v2.me();

            await client.v2.retweet(me.data.id, tweetId);

            return {
                success: true,
                message: `Tweet ${tweetId} retweeted successfully on Twitter`
            };
        } catch (error) {
            console.error('Twitter API Error:', error);
            throw new Error(`Failed to retweet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Delete a tweet using Twitter API v2
     */
    static async deleteTweet(tweetId: string): Promise<{ success: boolean; message: string }> {
        try {
            const client = this.getClient();

            await client.v2.deleteTweet(tweetId);

            return {
                success: true,
                message: `Tweet ${tweetId} deleted successfully from Twitter`
            };
        } catch (error) {
            console.error('Twitter API Error:', error);
            throw new Error(`Failed to delete tweet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get trending topics (mock implementation)
     */
    static async getTrendingTopics(): Promise<{ topics: string[]; message: string }> {
        try {
            // Mock trending topics
            const topics = [
                '#AI',
                '#Technology',
                '#Programming',
                '#WebDevelopment',
                '#MachineLearning'
            ];

            return {
                topics,
                message: 'Retrieved trending topics'
            };
        } catch (error) {
            throw new Error(`Failed to get trending topics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

/**
 * MCP Tool Definition for X (Twitter)
 */
export const xTool = {
    name: "x_twitter",
    description: "Post and retrieve tweets, like/retweet, delete tweets, and get trending topics on X (Twitter)",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: "string",
                enum: ["post_tweet", "get_tweets", "like_tweet", "retweet", "delete_tweet", "get_trending"],
                description: "The action to perform"
            },
            text: {
                type: "string",
                description: "Tweet text content (required for post_tweet)"
            },
            reply_to: {
                type: "string",
                description: "Tweet ID to reply to (optional for post_tweet)"
            },
            tweet_id: {
                type: "string",
                description: "Tweet ID for specific operations"
            },
            username: {
                type: "string",
                description: "Username to get tweets from"
            },
            limit: {
                type: "number",
                description: "Maximum number of tweets to retrieve"
            },
            search_query: {
                type: "string",
                description: "Search query to filter tweets"
            }
        },
        required: ["action"]
    }
};

/**
 * Handle X tool calls
 */
export async function handleXTool(args: any): Promise<any> {
    try {
        const { action, ...params } = args;

        switch (action) {
            case 'post_tweet':
                if (!params.text) {
                    throw new Error('Tweet text is required for posting');
                }
                return await XService.postTweet({
                    text: params.text,
                    reply_to: params.reply_to
                });

            case 'get_tweets':
                return await XService.getTweets({
                    tweet_id: params.tweet_id,
                    username: params.username,
                    limit: params.limit,
                    search_query: params.search_query
                });

            case 'like_tweet':
                if (!params.tweet_id) {
                    throw new Error('Tweet ID is required for liking');
                }
                return await XService.likeTweet(params.tweet_id);

            case 'retweet':
                if (!params.tweet_id) {
                    throw new Error('Tweet ID is required for retweeting');
                }
                return await XService.retweet(params.tweet_id);

            case 'delete_tweet':
                if (!params.tweet_id) {
                    throw new Error('Tweet ID is required for deletion');
                }
                return await XService.deleteTweet(params.tweet_id);

            case 'get_trending':
                return await XService.getTrendingTopics();

            default:
                throw new Error(`Unsupported action: ${action}`);
        }
    } catch (error) {
        throw new Error(`X (Twitter) error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
