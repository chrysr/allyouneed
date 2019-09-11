const fs = require("fs");
const util = require("util");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);


class ProductService{
    constructor(datafile){
        this.datafile=datafile;
    }

    async addentry(name,price,description,photo,date){
        const data= await this.getdata();
        data.unshift({name,price,description,photo,date});
        return writeFile(this.datafile,JSON.stringify(data));
    }

    async getlist(){
        const data = await this.getdata();
        return data;
    }

    async sortbyprice(){
        const data = await this.getdata();
        data.sort((a, b) => (a.price > b.price) ? 1 : -1);
        return data;
    }

    hascat(list,cat){
        for (let index = 0; index < list.length; index++) {
            if (list[index].category === cat) {
                return index;
            }  
        }
        return -1;
    }

    async categorieslist(){
        const data = await this.getdata();
        var catlist =[];
        //console.log(data);
        for (let index = 0; index < data.length; index++) {
            const cat=data[index].categories[0];
            var x = this.hascat(catlist,cat)
            if(x>-1){
                catlist[x].products.push(data[index]);
            }
            else
            {
                var obj={ "category":data[index].categories[0],"products":[data[index]] };
                catlist.push(obj);
            }
            
            
        }
        console.log(`\n\n`);
        console.log(catlist);
    }

    async getproduct(shortname) {
        const data = await this.getdata();
        const product = data.find((product)=>{
            return product.shortname ===shortname;
        });
        if (!product) {
            return null;
        }
        return {
            name :product.name,
            price :product.price,
            description :product.description,
            photo :product.photo,
            shortname :product.shortname,
        }
    }

    async getdata(){
        const data = await readFile(this.datafile,"utf8");
        //console.log(JSON.parse(data));
        if (!data) {
            return[];
        }
        return JSON.parse(data);
    }
}

module.exports = ProductService;