<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="text" indent="no"  />
		<xsl:template match="/">
&lt;cfcomponent persistent="true" table="<xsl:value-of select="//bean/@name"/>" output="false"&gt;
	<xsl:for-each select="root/bean/dbtable/column[@primaryKey='Yes']">&lt;cfproperty name="<xsl:value-of select="@name"/>" fieldtype="id" generator="identity" generated="always"/&gt;
	</xsl:for-each>	
	<xsl:for-each select="root/bean/dbtable/column[@primaryKey!='Yes']">&lt;cfproperty name="<xsl:value-of select="@name" />" type="<xsl:value-of select="@type" />" /&gt;
	</xsl:for-each>
	&lt;cffunction name="init" access="public" output="false"&gt;		
		&lt;cfreturn this /&gt;
 	&lt;/cffunction&gt;

    &lt;!---
        Get the memento of the object after you have loaded it:
        myuser = entityLoad("user", {id=1});
        myuser[1].getMemento();
        or 
        myuser = entityLoadByPK("user", 1);
        myuser.getMemento();
    ---&gt;
	&lt;cffunction name="getMemento" access="public" returntype="struct" output="false"&gt;
        &lt;cfset var memento = {}&gt;<xsl:for-each select="root/bean/dbtable/column">
        &lt;cfset memento["<xsl:value-of select="@name"/>"] = this.get<xsl:value-of select="@name"/>()/&gt;</xsl:for-each>
        &lt;cfreturn memento&gt;
    &lt;/cffunction&gt;
        
    &lt;!--- 
            ---------- EVENT LISTENERS --------------- 
            These are the event listeners that are used to handle the entity lifecycle.
            You can override these methods in your entity to handle custom logic.
            If you want to cancel an event, return true.
            If you do not need these, you can safely remove them.
    ---&gt;
   
    &lt;cffunction name="preInsert" hint="I run before this entity is inserted."&gt;
    <xsl:if test="column[@type='datetime' and @nullable='false']"> 
    <xsl:for-each select="column[@type='datetime' and @nullable='false']">
        &lt;cfif isNull(this.get<xsl:value-of select="@name"/>())&gt;
            &lt;cfset this.set<xsl:value-of select="@name"/>(now())&gt;
        &lt;/cfif&gt;
    </xsl:for-each></xsl:if>
        &lt;cfreturn /&gt;
    &lt;/cffunction&gt;    


    &lt;cffunction name="preLoad" hint="I run before this entity is loaded."&gt;
		&lt;!--- Return out. ---&gt;
		&lt;cfreturn /&gt;
	&lt;/cffunction&gt;

	&lt;cffunction name="postLoad" hint="I run after this entity is loaded."&gt;
		&lt;!--- Return out. ---&gt;
		&lt;cfreturn /&gt;
	&lt;/cffunction&gt;	

	&lt;cffunction name="postInsert" hint="I run before this entity is inserted."&gt;
		&lt;!--- Return out. ---&gt;
		&lt;cfreturn /&gt;
	&lt;/cffunction&gt;

	&lt;cffunction name="preUpdate" hint="I run before this entity is updated."&gt;
		&lt;cfargument name="oldData" type="struct" required="true" hint="I am the collection of data held over from the load time."/&gt;
		&lt;!---
			Return out. NOTE: If this method return TRUE, then the update is cancelled.
		---&gt;
		&lt;cfreturn /&gt;
	&lt;/cffunction&gt;

	&lt;cffunction name="postUpdate" hint="I run after this entity is updated."&gt;
		&lt;!--- Return out. ---&gt;
		&lt;cfreturn /&gt;
	&lt;/cffunction&gt;

	&lt;cffunction name="preDelete" hint="I run before this entity is deleted."&gt;
		&lt;!--- Return out. ---&gt;
		&lt;cfreturn /&gt;
	&lt;/cffunction&gt;

	&lt;cffunction name="postDelete" hint="I run after this entity is deleted."&gt;
		&lt;!--- Return out. ---&gt;
		&lt;cfreturn /&gt;
	&lt;/cffunction&gt;

&lt;/cfcomponent&gt;</xsl:template>
</xsl:stylesheet>