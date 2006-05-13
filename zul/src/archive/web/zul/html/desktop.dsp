<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
 "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ page contentType="text/html;charset=UTF-8" %><%--
desktop.dsp

{{IS_NOTE
	$Id: desktop.dsp,v 1.10 2006/04/24 07:04:42 tomyeh Exp $
	Purpose:
		Used to render a ZUL page as a complete page (aka., desktop)
		if it is not included
	Description:
		
	History:
		Fri Jun 10 09:16:14     2005, Created by tomyeh@potix.com
}}IS_NOTE

Copyright (C) 2005 Potix Corporation. All Rights Reserved.

{{IS_RIGHT
	This program is distributed under GPL Version 2.0 in the hope that
	it will be useful, but WITHOUT ANY WARRANTY.
}}IS_RIGHT
--%><%@ taglib uri="/WEB-INF/tld/web/core.dsp.tld" prefix="c" %>
<%@ taglib uri="/WEB-INF/tld/zul/core.dsp.tld" prefix="u" %>
<c:set var="arg" value="${requestScope.arg}"/>
<c:set var="page" value="${arg.page}"/>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>${page.title}</title>
${u:outLangStyleSheets()}
<meta http-equiv="Cache-Control" content="no-cache"/>
</head>
<body>
<c:include page="~./zul/html/page.dsp"/><%-- OC4J cannot handle relative page correctly --%>
</body>
</html>
