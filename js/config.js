/*
 * Configuração do modo "3D realista" (modelos fotorrealistas do Google, via CesiumJS).
 * Sem token o site funciona normalmente, só sem o botão "Ver em 3D realista".
 *
 * Use apenas o plano gratuito do Cesium ion (https://ion.cesium.com): ele não pede
 * cartão de crédito, então não há como gerar cobrança. Se a cota mensal acabar,
 * o modo realista só para de carregar até o mês seguinte.
 *
 * Por segurança, no painel do Cesium ion restrinja o token ao endereço do site
 * ("Allowed URLs"): ele fica visível para quem abrir o código da página.
 *
 * Não há opção de chave do Google de propósito: ela exige faturamento ativo e cobra
 * quando passa da cota gratuita.
 */
window.CONFIG = {
  cesiumIonToken: ""
};
