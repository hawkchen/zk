<%--
label.dsp

{{IS_NOTE
	$Id: label.dsp,v 1.6 2006/03/31 01:48:59 tomyeh Exp $
	Purpose:
		
	Description:
		
	History:
		Wed Jun  8 18:56:09     2005, Created by tomyeh@potix.com
}}IS_NOTE

Copyright (C) 2005 Potix Corporation. All Rights Reserved.

{{IS_RIGHT
	This program is distributed under GPL Version 2.0 in the hope that
	it will be useful, but WITHOUT ANY WARRANTY.
}}IS_RIGHT
--%><%@ taglib uri="/WEB-INF/tld/web/core.dsp.tld" prefix="c" %>
<c:set var="self" value="${requestScope.arg.self}"/>
<span id="${self.uuid}"${self.outerAttrs}${self.innerAttrs}><c:out value="${self.value}" maxlength="${self.maxlength}" multilineReplace="${self.multiline?'<br/>':''}"/></span>