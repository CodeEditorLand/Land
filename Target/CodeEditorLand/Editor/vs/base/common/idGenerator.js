class r{_prefix;_lastId;constructor(t){this._prefix=t,this._lastId=0}nextId(){return this._prefix+ ++this._lastId}}const i=new r("id#");export{r as IdGenerator,i as defaultGenerator};
