<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text" indent="no"/>  
  <xsl:template match="/">
const db = require('../db');
const <xsl:value-of select="//bean/@name"/> = require('../models/<xsl:value-of select="//bean/@name"/>');

class <xsl:value-of select="//bean/@name"/>DAO {
  async create(<xsl:value-of select="//bean/@name"/>Data) {
    const result = await db.query('INSERT INTO <xsl:value-of select="//bean/@name"/> (<xsl:for-each select="root/bean/dbtable/column[@primaryKey!='Yes']"><xsl:value-of select="@name"/><xsl:if test="position() != last()">, </xsl:if></xsl:for-each>) VALUES (<xsl:for-each select="root/bean/dbtable/column[@primaryKey!='Yes']">$<xsl:value-of select="position()"/><xsl:if test="position() != last()">, </xsl:if></xsl:for-each>) RETURNING *', [<xsl:for-each select="root/bean/dbtable/column[@primaryKey!='Yes']"><xsl:value-of select="//bean/@name"/>Data.<xsl:value-of select="@name"/><xsl:if test="position() != last()">, </xsl:if></xsl:for-each>]);
    return new <xsl:value-of select="//bean/@name"/>(result.rows[0]);
  }

  async findById(id) {
    const result = await db.query('SELECT * FROM <xsl:value-of select="//bean/@name"/> WHERE id = $1', [id]);
    return result.rows[0] ? new <xsl:value-of select="//bean/@name"/>(result.rows[0]) : null;
  }

  async update(id, <xsl:value-of select="//bean/@name"/>Data) {
    const result = await db.query('UPDATE <xsl:value-of select="//bean/@name"/> SET <xsl:for-each select="root/bean/dbtable/column[@primaryKey!='Yes']"><xsl:value-of select="@name"/> = $<xsl:value-of select="position() + 1"/><xsl:if test="position() != last()">, </xsl:if></xsl:for-each> WHERE id = $1 RETURNING *', [id, <xsl:for-each select="root/bean/dbtable/column[@primaryKey!='Yes']"><xsl:value-of select="//bean/@name"/>Data.<xsl:value-of select="@name"/><xsl:if test="position() != last()">, </xsl:if></xsl:for-each>]);
    return result.rows[0] ? new <xsl:value-of select="//bean/@name"/>(result.rows[0]) : null;
  }

  async delete(id) {
    await db.query('DELETE FROM <xsl:value-of select="//bean/@name"/> WHERE id = $1', [id]);
  }
}

module.exports = new <xsl:value-of select="//bean/@name"/>DAO();
  </xsl:template>
</xsl:stylesheet>