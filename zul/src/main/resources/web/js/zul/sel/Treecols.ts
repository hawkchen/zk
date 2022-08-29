/* Treecols.ts

	Purpose:

	Description:

	History:
		Wed Jun 10 15:32:41     2009, Created by jumperchen

Copyright (C) 2009 Potix Corporation. All Rights Reserved.

This program is distributed under LGPL Version 2.0 in the hope that
it will be useful, but WITHOUT ANY WARRANTY.
*/
/**
 * A treecols.
 * <p>Default {@link #getZclass}: z-treecols
 */
@zk.WrapClass('zul.sel.Treecols')
export class Treecols extends zul.mesh.HeadWidget {
	override parent!: zul.sel.Tree | undefined;
	override firstChild!: zul.sel.Treecol | undefined;
	override lastChild!: zul.sel.Treecol | undefined;

	/** Returns the tree that it belongs to.
	 * @return Tree
	 */
	getTree(): zul.sel.Tree | undefined {
		return this.parent;
	}

	override setVisible(visible: boolean, opts?: Record<string, boolean>): this {
		if (this._visible != visible) {
			super.setVisible(visible, opts);
			this.getTree()!.rerender();
		}
		return this;
	}

	override beforeChildAdded_(child: zk.Widget, insertBefore?: zk.Widget): boolean {
		if (!(child instanceof zul.sel.Treecol)) {
			zk.error('Unsupported child for treecols: ' + child.className);
			return false;
		}
		return true;
	}
}