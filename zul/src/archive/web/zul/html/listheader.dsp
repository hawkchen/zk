<%--
listheader.dsp

{{IS_NOTE
	$Id: listheader.dsp,v 1.6 2006/05/05 01:44:43 tomyeh Exp $
	Purpose:
		
	Description:
		
	History:
		Tue Aug  9 09:36:00     2005, Created by tomyeh@potix.com
}}IS_NOTE

Copyright (C) 2005 Potix Corporation. All Rights Reserved.

{{IS_RIGHT
	This program is distributed under GPL Version 2.0 in the hope that
	it will be useful, but WITHOUT ANY WARRANTY.
}}IS_RIGHT
--%><%@ taglib uri="/WEB-INF/tld/web/core.dsp.tld" prefix="c" %>
<c:set var="self" value="${requestScope.arg.self}"/>
<td id="${self.uuid}"${self.outerAttrs}${self.innerAttrs}>${self.imgTag}<c:out value="${self.label}"/></td>
