<%--
listcell.dsp

{{IS_NOTE
	$Id: listcell.dsp,v 1.7 2006/03/17 10:06:32 tomyeh Exp $
	Purpose:
		
	Description:
		
	History:
		Tue Aug  9 09:47:39     2005, Created by tomyeh@potix.com
}}IS_NOTE

Copyright (C) 2005 Potix Corporation. All Rights Reserved.

{{IS_RIGHT
	This program is distributed under GPL Version 2.0 in the hope that
	it will be useful, but WITHOUT ANY WARRANTY.
}}IS_RIGHT
--%><%@ taglib uri="/WEB-INF/tld/web/core.dsp.tld" prefix="c" %>
<%@ taglib uri="/WEB-INF/tld/zul/core.dsp.tld" prefix="u" %>
<c:set var="self" value="${requestScope.arg.self}"/>
<td id="${self.uuid}"${self.outerAttrs}${self.innerAttrs}>${self.columnHtmlPrefix}${self.imgTag}<c:out value="${self.label}" maxlength="${self.maxlength}"/><c:forEach var="child" items="${self.children}">
	${u:redraw(child, null)}
</c:forEach>${self.columnHtmlPostfix}</td>
