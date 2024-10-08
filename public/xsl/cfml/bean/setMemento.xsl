	&lt;!---
		&lt;cffunction name="setMemento" access="public" returntype="<xsl:value-of select="//bean/@path"/>" output="false"&gt;
		&lt;cfargument name="memento" type="struct" required="yes"/&gt;
		&lt;cfset variables.instance = arguments.memento /&gt;
		&lt;cfreturn this /&gt;
	&lt;/cffunction&gt;
	---&gt;
	&lt;cffunction name="getMemento" access="public" returntype="struct" output="false" &gt;
		&lt;cfreturn deserializeJson(serializeJson(this)) /&gt;
	&lt;/cffunction&gt;