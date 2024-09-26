<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="text" indent="no"  />
		<xsl:template match="/">
component persistent="true" table="<xsl:value-of select="//bean/@name"/>" output="false"{
	<xsl:for-each select="root/bean/dbtable/column[@primaryKey='Yes']">property name="<xsl:value-of select="@name"/>" fieldtype="id" generator="identity" generated="always";
	</xsl:for-each>	
	<xsl:for-each select="root/bean/dbtable/column[@primaryKey!='Yes']">property name="<xsl:value-of select="@name" />" type="<xsl:value-of select="@type" />";
	</xsl:for-each>
	function init() {		
		return this;
    }
    /*
        Get the memento of the object after you have loaded it:
        myuser = entityLoad("user", {id=1});
        myuser[1].getMemento();
        or 
        myuser = entityLoadByPK("user", 1);
        myuser.getMemento();
    */
	function getMemento(){
        var memento = {};<xsl:for-each select="root/bean/dbtable/column">
        memento["<xsl:value-of select="@name"/>"] = this.get<xsl:value-of select="@name"/>();</xsl:for-each>
        return memento;
    }
    /*
        --------------------- EVENT LISTENERS -----------------
        These are the event listeners that are used to handle the entity lifecycle.
        You can override these methods in your entity to handle custom logic.
        If you want to cancel an event, return true.
        If you do not need these, you can safely remove them.
    */

    function preInsert(){
        // I run before this entity is inserted.
<xsl:if test="column[@type='datetime' and @nullable='false']">
    <xsl:for-each select="column[@type='datetime' and @nullable='false']">
        if( isNull(this.get<xsl:value-of select="@name"/>()) ){
            this.set<xsl:value-of select="@name"/>(now());
        }
    </xsl:for-each></xsl:if>
        return;
    }
    
	function preLoad(){
		// I run before this entity is loaded.
		//Return out.
		return;
	}

	function postLoad(){
		//I run after this entity is loaded.
		// return..
		return;
	}	

	function postInsert(){
		//I run before this entity is inserted.
		// return..
		return;
	}

	function boolean preUpdate(required struct oldData){
		// I run before this entity is updated.		
		// I am the collection of data held over from the load time.
		// Return out. NOTE: If this method return TRUE, then the update is cancelled.
		return;
	}

	function postUpdate(){
		//I run after this entity is updated.
		// return..
		return;
	}

	function preDelete(){
		//I run before this entity is deleted.
		// return..
		return;
	}

	function postDelete(){
		//I run after this entity is deleted.
		// return..
		return;
	}


}</xsl:template>
</xsl:stylesheet>