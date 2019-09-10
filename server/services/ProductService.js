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

    async getdata(){
        const data = await readFile(this.datafile,"utf8");
        console.log(JSON.parse(data));
        if (!data) {
            return[];
        }
        return JSON.parse(data);
    }
}

module.exports = ProductService;