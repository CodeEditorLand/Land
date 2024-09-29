import{escape as o}from"../../../../../base/common/strings.js";import{localize as e}from"../../../../../nls.js";const c=n=>encodeURIComponent(JSON.stringify({profile:n})),t=400;var b=()=>`
<vertically-centered>
<checklist>
	<checkbox on-checked="command:notebook.setProfile?${c("default")}" checked-on="config.notebook.cellFocusIndicator == 'border' && config.notebook.insertToolbarLocation == 'both' && config.notebook.globalToolbar == false && config.notebook.compactView == true && config.notebook.showCellStatusBar == 'visible'">
		<img width="${t}" src="./notebookThemes/default.png"/>
		${o(e("default","Default"))}
	</checkbox>
	<checkbox on-checked="command:notebook.setProfile?${c("jupyter")}" checked-on="config.notebook.cellFocusIndicator == 'gutter' && config.notebook.insertToolbarLocation == 'notebookToolbar' && config.notebook.globalToolbar == true && config.notebook.compactView == true  && config.notebook.showCellStatusBar == 'visible'">
		<img width="${t}" src="./notebookThemes/jupyter.png"/>
		${o(e("jupyter","Jupyter"))}
	</checkbox>
	<checkbox on-checked="command:notebook.setProfile?${c("colab")}" checked-on="config.notebook.cellFocusIndicator == 'border' && config.notebook.insertToolbarLocation == 'betweenCells' && config.notebook.globalToolbar == false && config.notebook.compactView == false && config.notebook.showCellStatusBar == 'hidden'">
		<img width="${t}" src="./notebookThemes/colab.png"/>
		${o(e("colab","Colab"))}
	</checkbox>
</checklist>
</vertically-centered>
`;export{b as default};
