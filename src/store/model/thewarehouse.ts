import {Store} from './store';
import {getProductLinksBuilder} from './helpers/card';

export const TheWarehouse: Store = {
  currency: '$',
  labels: {
    outOfStock: {
      container:
        '#maincontent > div.container.product-detail.product-wrapper.pb-xl.pb-lg-xxxl > div > div:nth-child(2) > div.col-12.col-md-6.col-lg-5 > div > div.product-buying-box > div.cart-and-ipay.mt-md > div > div > button:disabled',
      text: ['Add to Cart'],
    },
  },
  links: [
    {
      brand: 'sony',
      model: 'ps5 console',
      series: 'sonyps5c',
      url: 'https://www.thewarehouse.co.nz/R2695122.html',
    },
    {
      brand: 'sony',
      model: 'ps5 digital',
      series: 'sonyps5de',
      url: 'https://www.thewarehouse.co.nz/R2695123.html',
    },
    {
      brand: 'microsoft',
      model: 'xbox series x',
      series: 'xboxsx',
      url: 'https://www.thewarehouse.co.nz/R2708605.html',
    },
    {
      brand: 'microsoft',
      model: 'xbox series s',
      series: 'xboxss',
      url: 'https://www.thewarehouse.co.nz/R2708604.html',
    },
  ],
  name: 'thewarehouse',
  linksBuilder: {
    builder: getProductLinksBuilder({
      productsSelector: '.product-tile',
      sitePrefix: 'https://www.thewarehouse.co.nz',
      titleSelector: '.product-title',
    }),
    urls: [
      {
        series: 'ps5',
        url: 'https://www.thewarehouse.co.nz/c/playstation-5',
      },
      {
        series: 'xbox',
        url: 'https://www.thewarehouse.co.nz/c/xbox-series-x',
      },
    ],
  },
};
