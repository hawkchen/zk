<%--
listbox-select.dsp

{{IS_NOTE
	$Id: listbox-select.dsp,v 1.5 2006/03/17 10:06:32 tomyeh Exp $
	Purpose:
		
	Description:
		
	History:
		Wed Sep 28 14:01:24     2005, Created by tomyeh@potix.com
}}IS_NOTE

Copyright (C) 2005 Potix Corporation. All Rights Reserved.

{{IS_RIGHT
	This program is distributed under GPL Version 2.0 in the hope that
	it will be useful, but WITHOUT ANY WARRANTY.
}}IS_RIGHT
--%><%@ taglib uri="/WEB-INF/tld/web/core.dsp.tld" prefix="c" %>
<c:set var="self" value="${requestScope.arg.self}"/>
<select id="${self.uuid}" zk_type="zul.html.sel.Lisel"${self.outerAttrs}${self.innerAttrs}>
	<c:forEach var="item" items="${self.items}">
	<option id="${item.uuid}"${item.outerAttrs}${item.innerAttrs}><c:out value="${item.label}" maxlength="${self.maxlength}"/></option>
	</c:forEach><%-- for better performance, we don't use u:redraw --%>
</select>
