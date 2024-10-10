<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text" indent="no"/>  
  <xsl:template match="/">
&lt;?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

<xsl:apply-templates select="//table"/>
  </xsl:template>
  
  <xsl:template match="table">
Route::apiResource('<xsl:value-of select="translate(//bean/@name, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>s', App\Http\Controllers\API\<xsl:value-of select="//bean/@name"/>Controller::class);
  </xsl:template>
</xsl:stylesheet>