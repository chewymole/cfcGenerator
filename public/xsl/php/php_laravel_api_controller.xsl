<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text" indent="no"/>  
  <xsl:template match="/">
&lt;?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\<xsl:value-of select="//bean/@name"/>;
use Illuminate\Http\Request;

class <xsl:value-of select="//bean/@name"/>Controller extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return <xsl:value-of select="//bean/@name"/>::all();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            <xsl:for-each select="root/bean/dbtable/column[not(@primaryKey='Yes')]">
            '<xsl:value-of select="@name"/>' => '<xsl:if test="@required='Yes'">required|</xsl:if><xsl:call-template name="mapValidationType"><xsl:with-param name="dataType" select="@type"/></xsl:call-template>',</xsl:for-each>
        ]);

        return <xsl:value-of select="//bean/@name"/>::create($request->all());
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return <xsl:value-of select="//bean/@name"/>::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $<xsl:value-of select="//bean/@name"/> = <xsl:value-of select="//bean/@name"/>::findOrFail($id);
        $<xsl:value-of select="//bean/@name"/>->update($request->all());
        return $<xsl:value-of select="//bean/@name"/>;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $<xsl:value-of select="//bean/@name"/> = <xsl:value-of select="//bean/@name"/>::findOrFail($id);
        $<xsl:value-of select="//bean/@name"/>->delete();
        return response()->json(null, 204);
    }
}
  </xsl:template>

  <xsl:template name="mapValidationType">
    <xsl:param name="dataType"/>
    <xsl:choose>
      <xsl:when test="$dataType = 'numeric'">numeric</xsl:when>
      <xsl:when test="$dataType = 'date'">date</xsl:when>
      <xsl:when test="$dataType = 'string'">string</xsl:when>
      <xsl:otherwise>string</xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>