import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { createClient } from 'supabase';

dotenv.config();

const app = express();
const port = 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Reddit API endpoint - Replace with actual Reddit API endpoint for trending topics
const REDDIT_TRENDS_URL = 'https://www.reddit.com/r/trending/hot.json?limit=10';

// Google Trends API endpoint -  Direct API access is limited. Consider using a library or alternative.
// For this example, we'll use a placeholder and note that direct Google Trends API might require more setup.
const GOOGLE_TRENDS_URL = 'https://trends.google.com/trends/api/dailytrends?geo=US&hl=en-US&ed=today';

app.get('/api/reddit-trends', async (req, res) => {
  try {
    console.log('Fetching Reddit trends...');
    const response = await fetch(REDDIT_TRENDS_URL);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: ${response.status}\`);
    }
    const data = await response.json();

    // Store Reddit trends in Supabase
    if (data.data && data.data.children) {
      const trends = data.data.children.map(child => ({
        source: 'reddit',
        topic: child.data.title,
        timestamp: new Date().toISOString(),
        details_url: \`https://www.reddit.com${child.data.permalink}\`
      }));
      const { error } = await supabase
        .from('trends') // Ensure you have a table named 'trends' in Supabase
        .insert(trends);
      if (error) {
        console.error('Supabase error:', error);
      } else {
        console.log('Reddit trends stored in Supabase.');
      }
    }

    res.json(data);
    console.log('Reddit trends fetched and sent.');
  } catch (error) {
    console.error('Error fetching Reddit trends:', error);
    res.status(500).send({ error: 'Failed to fetch Reddit trends' });
  }
});

app.get('/api/google-trends', async (req, res) => {
  try {
    console.log('Fetching Google trends...');
    // **Note:** Direct Google Trends API is complex and often requires authentication or scraping.
    // The placeholder URL is unlikely to work directly without proper API setup.
    // Consider using a Google Trends API library or exploring alternative data sources if direct API access is not feasible.
    const response = await fetch(GOOGLE_TRENDS_URL);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: ${response.status}\`);
    }
    const data = await response.text(); // Google Trends API might return different content type

    // **Important:** Parsing Google Trends data will depend on the actual API response format.
    // This is a placeholder and might require significant adjustments based on the real API.
    // Example parsing (may not be correct):
    // const trends = parseGoogleTrendsData(data); // Implement a parsing function

    // For now, just store raw data for demonstration
    const trends = [{
      source: 'google_trends',
      topic: 'Raw Google Trends Data',
      timestamp: new Date().toISOString(),
      details: data // Store raw data for now
    }];


    const { error } = await supabase
      .from('trends') // Ensure you have a table named 'trends' in Supabase
      .insert(trends);
    if (error) {
      console.error('Supabase error:', error);
    } else {
      console.log('Google trends (raw data) stored in Supabase.');
    }


    res.send(data); // Send raw data for now
    console.log('Google trends fetched and sent (raw data).');

  } catch (error) {
    console.error('Error fetching Google trends:', error);
    res.status(500).send({ error: 'Failed to fetch Google trends' });
  }
});

app.listen(port, () => {
  console.log(\`Server listening at http://localhost:${port}\`);
});
