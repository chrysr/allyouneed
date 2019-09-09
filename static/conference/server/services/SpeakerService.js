const fs = require("fs");
const util = require("util");

const readFile = util.promisify(fs.readFile);


class SpeakerService{
    constructor(datafile){
        this.datafile=datafile;
    }

    async getnames(){
        const data = await this.getdata();

        return data.map((speaker)=>{
            return {name : speaker.name, shortname : speaker.shortname};
        });
    }


    async getlistshort(){
        const data = await this.getdata();

        return data.map((speaker)=>{
            return {name : speaker.name, shortname : speaker.shortname, title:speaker.title};
        });
    }

    async getlist(){
        const data = await this.getdata();

        return data.map((speaker)=>{
            return {name : speaker.name, shortname : speaker.shortname, title:speaker.title, summary :speaker.summary };
        });
    }

    async getartwork(){
        const data = await this.getdata();
        const artwork = data.reduce((acc,elm)=>{
            if (elm.artwork) {
                acc = [...acc,...elm.artwork];
            }
            return acc;
        },[]);
        return artwork;
    }

    async getspeaker(shortname) {
        const data = await this.getdata();
        const speaker = data.find((speaker)=>{
            return speaker.shortname ===shortname;
        });
        if (!speaker) {
            return null;
        }
        return {
            title :speaker.title,
            name :speaker.name,
            shortname :speaker.shortname,
            description :speaker.description,
        }
    }

    async getspeakerartwork(shortname){
        const data = await this.getdata();
        const speaker = data.find((speaker)=>{
            return speaker.shortname ===shortname;
        });
        if (!speaker||!speaker.artwork) {
            return null;
        }
        return speaker.artwork;
    }

    async getdata(){
        const data = await readFile(this.datafile,"utf8");
        if (!data) {
            return[];
        }
        return JSON.parse(data).speakers;
    }
}

module.exports = SpeakerService;