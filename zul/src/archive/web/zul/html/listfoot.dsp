<%--
listfoot.dsp

{{IS_NOTE
	$Id: listfoot.dsp,v 1.3 2006/03/17 10:06:32 tomyeh Exp $
	Purpose:
		
	Description:
		
	History:
		Fri Jan 13 13:00:59     2006, Created by tomyeh@potix.com
}}IS_NOTE

Copyright (C) 2006 Potix Corporation. All Rights Reserved.

{{IS_RIGHT
	This program is distributed under GPL Version 2.0 in the hope that
	it will be useful, but WITHOUT ANY WARRANTY.
}}IS_RIGHT
--%><%@ taglib uri="/WEB-INF/tld/web/core.dsp.tld" prefix="c" %>
<%@ taglib uri="/WEB-INF/tld/zul/core.dsp.tld" prefix="u" %>
<c:set var="self" value="${requestScope.arg.self}"/>
<tr id="${self.uuid}"${self.outerAttrs}${self.innerAttrs}>
	<c:forEach var="child" items="${self.children}">
	${u:redraw(child, null)}
	</c:forEach>
</tr>
