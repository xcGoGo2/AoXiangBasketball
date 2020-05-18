var wrapper = {__isWrapper: true};
for (let key in wx){
	wrapper[key] = wx[key];
}

export default wrapper;
