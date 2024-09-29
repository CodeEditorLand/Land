function i(t,e){const r=this;let u=!1,n;return function(){if(u)return n;if(u=!0,e)try{n=t.apply(r,arguments)}finally{e()}else n=t.apply(r,arguments);return n}}export{i as createSingleCallFunction};
