<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <xsl:output method="text" indent="no"/>  
  <xsl:template match="/">  
const express = require('express');
const router = express.Router();
const <xsl:value-of select="//bean/@name"/>DAO = require('../dao/<xsl:value-of select="//bean/@name"/>DAO');

// Create a new <xsl:value-of select="//bean/@name"/>
router.post('/', async (req, res) => {
  try {
    const new<xsl:value-of select="//bean/@name"/> = await <xsl:value-of select="//bean/@name"/>DAO.create(req.body);
    res.status(201).json(new<xsl:value-of select="//bean/@name"/>);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a <xsl:value-of select="//bean/@name"/> by id
router.get('/:id', async (req, res) => {
  try {
    const <xsl:value-of select="//bean/@name"/> = await <xsl:value-of select="//bean/@name"/>DAO.findById(req.params.id);
    if (<xsl:value-of select="//bean/@name"/>) {
      res.json(<xsl:value-of select="//bean/@name"/>);
    } else {
      res.status(404).json({ message: '<xsl:value-of select="//bean/@name"/> not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a <xsl:value-of select="//bean/@name"/>
router.put('/:id', async (req, res) => {
  try {
    const updated<xsl:value-of select="//bean/@name"/> = await <xsl:value-of select="//bean/@name"/>DAO.update(req.params.id, req.body);
    if (updated<xsl:value-of select="//bean/@name"/>) {
      res.json(updated<xsl:value-of select="//bean/@name"/>);
    } else {
      res.status(404).json({ message: '<xsl:value-of select="//bean/@name"/> not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a <xsl:value-of select="//bean/@name"/>
router.delete('/:id', async (req, res) => {
  try {
    await <xsl:value-of select="//bean/@name"/>DAO.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
  </xsl:template>
</xsl:stylesheet>