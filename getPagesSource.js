// @author Rob W <http://stackoverflow.com/users/938089/rob-w>
// Demo: var serialized_html = DOMtoString(document);

function adicionaLista(produtos){
  chrome.storage.local.get(['produtos_frontier'], function(items) {
    if(items.produtos_frontier){

      var arrProdutos;

      arrProdutos = produtos;

      chrome.storage.local.set({'produtos_frontier': JSON.stringify(arrProdutos)}, function() {
            console.log('Os dados Foram Salvos');
          });

      return arrProdutos;

    } else {
      var arrProdutos = new Array();
      arrProdutos = produtos;

      chrome.storage.local.set({'produtos_frontier': JSON.stringify(arrProdutos)}, function() {
          console.log('Os dados Foram Salvos Pela primeira vez.');

        });
        return arrProdutos;
    }

  });

}

function isPreco(dado){
  var patt = /\d*.\d*,\d*/;

  if(patt.test(dado)){
    return dado;
  } else {
    return null;
  }
}

function isMedidas(str){
  var arrMedidas = []
  var medidas = {
    altura:       null,
    largura:      null,
    comprimento:  null,
    diametro:     null
  };

  if (str.toUpperCase().indexOf("X") > -1) {
    arrMedidas = str.split("X");
    for (var i = 0; i < arrMedidas.length; i++) {
      if(arrMedidas[i].includes("H")){
        medidas.altura = arrMedidas[i].split("H")[0];
      }
      if(arrMedidas[i].includes("L")){
        medidas.largura = arrMedidas[i].split("L")[0];
      }
      if(arrMedidas[i].includes("C")){
        medidas.comprimento = arrMedidas[i].split("C")[0];
      }
      if(arrMedidas[i].includes("D")){
        medidas.diametro = arrMedidas[i].split("D")[0];
      }
    }
  }
  return medidas;
}

function DOMtoString(document_root) {

    //Captura todos os Nodes de produtos do album
    var arrFotos = document_root.getElementsByClassName('photo-list-photo-view');

    var arrProdutos = [];

    for(var i = 0; i < arrFotos.length; i++){
      // Objeto que receberá os dados dos produtos
      var produto = {
        cod           :   null,
        nome          :   null,
        preco         :   null,
        preco_de      :   null,
        medidas       :   {altura: null, largura: null, comprimento: null, diametro: null},
        url_foto     :   null,
        link_fornecedor  :   null,
      };

      // Capturando o link da foto
      var link_foto = arrFotos[i].style.backgroundImage.replace('url("', "https:").replace('")', "");

      produto.url_foto = link_foto;

      // Capturando o Link do produto
      var link_produto = arrFotos[i].children[0].children[0].children[0].href;

      produto.link_fornecedor = link_produto;

      // Capturando linha com dados do produtos

      var strDados = arrFotos[i].children[0].children[0].children[0].getAttribute("aria-label").replace(" por frontierimportadora1", "");
      var arrDados = strDados.split(" ");

      produto.cod = arrDados[0];

      for(var j = 0; j < arrDados.length; j++){
        var preco = isPreco(arrDados[j]);

        if(preco != null){
          produto.preco = preco;
        }

        var medidas = isMedidas(arrDados[j]);
        if(medidas.altura || medidas.largura || medidas.comprimento || medidas.diametro){
          if(medidas.altura){
            produto.medidas.altura = medidas.altura;
          } else {
            produto.medidas.altura = null;
          }

          if(medidas.largura){
            produto.medidas.largura = medidas.largura;
          } else {
            produto.medidas.largura = null;
          }

          if(medidas.comprimento){
            produto.medidas.comprimento = medidas.comprimento;
          } else {
            produto.medidas.comprimento = null;
          }

          if(medidas.diametro){
            produto.medidas.diametro = medidas.diametro;
          } else {
            produto.medidas.diametro = null;
          }
        }
      }

      arrProdutos.push(produto);
    }
    var jsonProdutos = adicionaLista(arrProdutos);

    return jsonProdutos;
}

chrome.runtime.sendMessage({
    action: "getSource",
    source: DOMtoString(document)
});
