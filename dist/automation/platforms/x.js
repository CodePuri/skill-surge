async function accessToken(credentials, fetchImpl) {
    const tokenResponse = await fetchImpl('https://api.x.com/2/oauth2/token', {
        method: 'POST',
        headers: {
            authorization: `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64')}`,
            'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: credentials.refreshToken }).toString(),
    });
    const token = await parseJson(tokenResponse, 'X token refresh');
    if (!token.access_token)
        throw new Error('X token refresh returned no access token');
    return token.access_token;
}
async function parseJson(response, label) {
    const value = await response.json().catch(() => ({}));
    if (!response.ok)
        throw new Error(`${label} failed (${response.status})`);
    return value;
}
export async function publishToX(content, credentials, fetchImpl = fetch) {
    const token = await accessToken(credentials, fetchImpl);
    const posts = content.body.split(/\n\s*---\s*\n/).map(post => post.trim()).filter(Boolean);
    let rootId;
    let previousId;
    for (const text of posts) {
        const body = { text };
        if (previousId)
            body.reply = { in_reply_to_tweet_id: previousId };
        const response = await fetchImpl('https://api.x.com/2/tweets', {
            method: 'POST',
            headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
            body: JSON.stringify(body),
        });
        const published = await parseJson(response, 'X publication');
        const id = published.data?.id;
        if (!id)
            throw new Error('X publication returned no post id');
        rootId ??= id;
        previousId = id;
    }
    if (!rootId)
        throw new Error('X publication contained no posts');
    return { externalId: rootId, url: `https://x.com/${credentials.userId}/status/${rootId}` };
}
export async function collectXMetrics(result, credentials, fetchImpl = fetch) {
    if (!result.externalId)
        return {};
    const token = await accessToken(credentials, fetchImpl);
    const response = await fetchImpl(`https://api.x.com/2/tweets/${result.externalId}?tweet.fields=public_metrics,non_public_metrics,organic_metrics`, {
        headers: { authorization: `Bearer ${token}` },
    });
    const payload = await parseJson(response, 'X metrics');
    const metrics = { ...(payload.data?.public_metrics ?? {}), ...(payload.data?.organic_metrics ?? {}), ...(payload.data?.non_public_metrics ?? {}) };
    return {
        impressions: metrics.impression_count,
        likes: metrics.like_count,
        shares: metrics.retweet_count,
        comments: metrics.reply_count,
        clicks: metrics.url_link_clicks,
    };
}
