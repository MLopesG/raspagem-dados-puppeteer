module.exports.index = (req,res)=>{
	const request = require('request');
    const cheerio = require('cheerio');
    const moment = require("moment");
    const fs = require('fs');

    moment.locale('pt-BR');

    fs.exists('antt.json',(exists)=>{
        if(exists){
            let data = JSON.parse(fs.readFileSync('antt.json'));
            let ultimaAtualizacao = moment(data.atualizado,"DD/MM/YYYY HH:mm").format('HH'); // Utima atualização

            if(moment().format('HH') > ultimaAtualizacao){
                fs.unlink('antt.json',(err)=>{
                    if(err) return console.log(err);
                }); 
                
                return res.redirect('/antt');
            }

            res.json(data);
        }else{
            request('https://www.antt.gov.br/web/guest/noticias-e-eventos', function(error, response, html) {
              	var $ = cheerio.load(html);

                var results = [];

                $('.cards a').each(function(i){
                    if(i < 6){
                        let data = $(this).find('.subtexto').eq(0).text().trim();
                        let titulo = $(this).find('.corpo h5').eq(0).text().trim();
                        let imagem = $(this).find('img').eq(0).attr('src');
                        let link = $(this).eq(0).attr('href');

                        results.push({
                            titulo: titulo,
                            link: `https://www.antt.gov.br/${link}`,
                            imagem: imagem,
                            data:data
                        });  
                    }          
                });

                let data = {
                    "atualizado":moment().format("DD/MM/YYYY HH:mm"),
                    "success": true,
                    "data": {
                        "noticias": results
                    }
                };

                fs.writeFileSync('antt.json', JSON.stringify(data));

                res.json(data);
            });
        }
    });
}