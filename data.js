
        class VM {
            constructor(options, elementId) {
                this.modelObj = {};
                this.fragment = null;
                this.matchModuleReg = new RegExp('\{\{\s*.*?\s*\}\}','gi');
                this.nodeArr = [];
                this.data = options.data;
                this.el = document.querySelector(elementId);
                this.init();
                
            }

            init() {
                this.observer();

                this.createNodeFragment();
                for(const key of Object.keys(this.data)) {
                    this.matchElementModule(key);
                }
                this.el.appendChild(this.fragment);
            }

            observer() {
                const handler = {
                    get: (target , propkey) => {
                        console.log(`监听到${propkey}改变，值为${target[propkey]}`);
                        
                        return target[propkey];
                    },

                    set: (target , propkey , value) => {
                        
                        if(target[propkey] !== value){
                            target[propkey] = value;
                            this.watcher(propkey);
                        }
                        return true;
                    }
                }

                this.data = new Proxy(this.data, handler);
            }

            changeElementData(value) {
                this.el.innerHTML = value;
            }

            createNodeFragment() {
                let documentFragment = document.createDocumentFragment();
                let child = this.el.firstChild;

                while(child) {
                    documentFragment.appendChild(child);
                    child = this.el.firstChild;
                }

                this.fragment = documentFragment;
            }

            


            matchElementModule(key,fragment) {
                const childNodes = fragment || this.fragment.childNodes;
                [].slice.call(childNodes).forEach((node) => {

                        if(node.getAttribute && this.checkAttribute(node)){
                            const tmpAttribute = this.checkAttribute(node);
                            if(!this.modelObj[tmpAttribute]) {
                                this.modelObj[tmpAttribute] = [];
                            }
                            this.modelObj[tmpAttribute].push(node);
                            this.setModelData(tmpAttribute,node);
                            this.bindModelData(tmpAttribute,node);
                        }



        /*!*/            if(node.nodeType === 3 && this.matchModuleReg.test(node.textContent)){
                            node.defaultContent = node.textContent;
                            this.changeData(node);
                            this.nodeArr.push(node);
                        }

                        if(node.childNodes && node.childNodes.length){
                            this.matchElementModule(key,node.childNodes);
                        }

                })
            }

            


            changeData(node) {
                const matchArr = node.defaultContent.match(this.matchModuleReg);
                let tmpStr = node.defaultContent;
                for(const key of matchArr) {
                    tmpStr = tmpStr.replace(key,this.data[key.replace(/\{\{|\}\}|\s*/g,'')] || '');
                }

                node.textContent = tmpStr;
            }


            watcher(key) {
                if(this.modelObj[key]) {
                    this.modelObj[key].forEach(node => {
                        this.setModelData(key, node);
                    })
                }

                for(const node of this.nodeArr) {
                    this.changeData(node);
                }
            }

            bindModelData(key, node) {
                if (this.data[key]) {
                    node.addEventListener('input', (e) => {
                        this.data[key] = e.target.value;
                    } , false);

                }
            }

            setModelData(key, node) {
                node.value = this.data[key];
            }

            checkAttribute(node) {
                return node.getAttribute('y-model');
            }

        }

        let vm = new VM({
            data: {
                name:'defaultname'
                
            },
        },'#app');

        

        

