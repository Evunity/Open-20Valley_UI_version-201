import { RequestHandler } from 'express';

// In-memory storage for integration configs (in production, use a database)
const integrationConfigs: Record<string, Record<string, any>> = {
  northbound: {},
  southbound: {}
};

export const handleSaveIntegration: RequestHandler = (req, res) => {
  try {
    const { type, name, config } = req.body;

    if (!type || !name || !config) {
      res.status(400).json({ error: 'Missing required fields: type, name, config' });
      return;
    }

    if (!['northbound', 'southbound'].includes(type)) {
      res.status(400).json({ error: 'Invalid integration type' });
      return;
    }

    // Validate config based on type
    if (type === 'northbound') {
      if (!config.endpoint || !config.apiKey) {
        res.status(400).json({ error: 'Northbound integrations require endpoint and apiKey' });
        return;
      }
    } else if (type === 'southbound') {
      if (!config.port) {
        res.status(400).json({ error: 'Southbound integrations require port configuration' });
        return;
      }
    }

    // Save integration config
    if (!integrationConfigs[type]) {
      integrationConfigs[type] = {};
    }
    integrationConfigs[type][name] = config;

    // Log the configuration (in production, save to database)
    console.log(`Integration saved: ${type}/${name}`, config);

    res.json({
      success: true,
      message: `${name} integration configured successfully`,
      integration: {
        type,
        name,
        config
      }
    });
  } catch (error) {
    console.error('Integration save error:', error);
    res.status(500).json({ error: 'Failed to save integration' });
  }
};

export const handleGetIntegrations: RequestHandler = (req, res) => {
  try {
    res.json({
      northbound: integrationConfigs.northbound || {},
      southbound: integrationConfigs.southbound || {}
    });
  } catch (error) {
    console.error('Integration fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
};

export const handleGetIntegration: RequestHandler = (req, res) => {
  try {
    const { type, name } = req.params;

    if (!type || !name) {
      res.status(400).json({ error: 'Missing type or name parameter' });
      return;
    }

    if (!['northbound', 'southbound'].includes(type)) {
      res.status(400).json({ error: 'Invalid integration type' });
      return;
    }

    const config = integrationConfigs[type]?.[name];
    if (!config) {
      res.status(404).json({ error: 'Integration not found' });
      return;
    }

    res.json({
      type,
      name,
      config
    });
  } catch (error) {
    console.error('Integration fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch integration' });
  }
};
