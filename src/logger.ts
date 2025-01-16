import {Link, Store} from './store/model';
import chalk from 'chalk';
import {config} from './config';
import winston from 'winston';

interface StatusMap {
  [key: string]: {
    line: number;
    message: string;
  };
}

// Track the line number for each product
const statusMap: StatusMap = {};
let initialized = false;
let totalLines = 0;

// Initialize the display with all websites and products
const initializeDisplay = (stores: Store[], products: {store: Store; link: Link}[]) => {
  if (initialized) return;
  
  // Clear screen
  process.stdout.write('\x1Bc');
  
  // Group products by store
  const storeGroups = products.reduce((acc, {store, link}) => {
    if (!acc[store.name]) {
      acc[store.name] = [];
    }
    acc[store.name].push(link);
    return acc;
  }, {} as Record<string, Link[]>);
  
  let currentLine = 0;
  
  // Print each store section with placeholders
  Object.entries(storeGroups).sort().forEach(([storeName, links]) => {
    // Print store header
    process.stdout.write(`[${storeName.toLowerCase()}]\n`);
    currentLine++;
    
    // Print each product line with placeholder
    links.forEach(link => {
      const id = `${storeName}-${link.brand}-${link.model}`;
      statusMap[id] = {
        line: currentLine,
        message: `  ✖  [${link.brand} (${link.series})] ${link.model} :: INITIALIZING...`
      };
      process.stdout.write(`${statusMap[id].message}\n`);
      currentLine++;
    });
  });
  
  totalLines = currentLine;
  initialized = true;
};

const updateLine = (lineNumber: number, text: string) => {
  // Save cursor position
  process.stdout.write('\x1B7');
  // Move to line
  process.stdout.write(`\x1B[${lineNumber};0H`);
  // Clear line and write new text
  process.stdout.write('\x1B[2K' + text);
  // Restore cursor position
  process.stdout.write('\x1B8');
};

const updateStatus = (store: Store, link: Link, message: string) => {
  const id = `${store.name}-${link.brand}-${link.model}`;
  if (statusMap[id]) {
    statusMap[id].message = `  ${message}`;
    updateLine(statusMap[id].line, statusMap[id].message);
  }
};

function buildProductString(link: Link, store: Store, color?: boolean): string {
  return `[${link.brand} (${link.series})] ${link.model}`;
}

function buildSetupString(topic: string, store: Store, color?: boolean): string {
  return `[setup (${topic})]`;
}

export const Print = {
  backoff(
    link: Link,
    store: Store,
    parameters: {delay: number; statusCode: number},
    color?: boolean
  ): string {
    const message = `✖  ${buildProductString(link, store)} :: BACKOFF DELAY status=${parameters.statusCode} delay=${parameters.delay} [Last update: ${new Date().toLocaleTimeString()}]`;
    updateStatus(store, link, message);
    return message;
  },

  badStatusCode(
    link: Link,
    store: Store,
    statusCode: number,
    color?: boolean
  ): string {
    let statusMessage = '';
    switch (statusCode) {
      case 403:
        statusMessage = 'ACCESS DENIED (Possible rate limiting or automation detection)';
        break;
      case 404:
        statusMessage = link.url.includes('TBD') ? 'PLACEHOLDER URL (Product page not created yet)' : 'PAGE NOT FOUND';
        break;
      case 410:
        statusMessage = 'URL PERMANENTLY REMOVED';
        break;
      case 429:
        statusMessage = 'RATE LIMITED';
        break;
      case 503:
        statusMessage = 'SERVICE UNAVAILABLE (Possible Cloudflare protection)';
        break;
      default:
        statusMessage = `STATUS CODE ERROR ${statusCode}`;
    }

    const message = `✖  ${buildProductString(link, store)} :: ${statusMessage} [Last update: ${new Date().toLocaleTimeString()}]`;
    updateStatus(store, link, message);
    return message;
  },

  bannedSeller(link: Link, store: Store, color?: boolean): string {
    const message = `✖  ${buildProductString(link, store)} :: BANNED SELLER [Last update: ${new Date().toLocaleTimeString()}]`;
    updateStatus(store, link, message);
    return message;
  },

  captcha(link: Link, store: Store, color?: boolean): string {
    const message = `✖  ${buildProductString(link, store)} :: CAPTCHA [Last update: ${new Date().toLocaleTimeString()}]`;
    updateStatus(store, link, message);
    return message;
  },

  cloudflare(link: Link, store: Store, color?: boolean): string {
    const message = `✖  ${buildProductString(link, store)} :: CLOUDFLARE, WAITING [Last update: ${new Date().toLocaleTimeString()}]`;
    updateStatus(store, link, message);
    return message;
  },

  inStock(link: Link, store: Store, color?: boolean, sms?: boolean): string {
    const message = sms 
      ? `${buildProductString(link, store)} :: IN STOCK`
      : `🚀🚨 ${buildProductString(link, store)} :: IN STOCK 🚨🚀 [Last update: ${new Date().toLocaleTimeString()}]`;
    updateStatus(store, link, message);
    return message;
  },

  inStockWaiting(link: Link, store: Store, color?: boolean): string {
    const message = `✖  ${buildProductString(link, store)} :: IN STOCK, WAITING [Last update: ${new Date().toLocaleTimeString()}]`;
    updateStatus(store, link, message);
    return message;
  },

  maxPrice(
    link: Link,
    store: Store,
    maxPrice: number,
    color?: boolean
  ): string {
    const message = `✖  ${buildProductString(link, store)} :: PRICE ${maxPrice} [Last update: ${new Date().toLocaleTimeString()}]`;
    updateStatus(store, link, message);
    return message;
  },

  message(
    message: string,
    series: string,
    store: Store,
    color?: boolean
  ): string {
    return `✖  [setup (${series})] :: ${message} [Last update: ${new Date().toLocaleTimeString()}]`;
  },

  noResponse(link: Link, store: Store, color?: boolean): string {
    const message = `✖  ${buildProductString(link, store)} :: NO RESPONSE [Last update: ${new Date().toLocaleTimeString()}]`;
    updateStatus(store, link, message);
    return message;
  },

  outOfStock(link: Link, store: Store, color?: boolean): string {
    const message = `✖  ${buildProductString(link, store)} :: OUT OF STOCK [Last update: ${new Date().toLocaleTimeString()}]`;
    updateStatus(store, link, message);
    return message;
  },

  productInStock(link: Link): string {
    let productString = `Product Page: ${link.url}`;
    if (link.cartUrl) productString += `\nAdd To Cart Link: ${link.cartUrl}`;
    return productString;
  },

  rateLimit(link: Link, store: Store, color?: boolean): string {
    const message = `✖  ${buildProductString(link, store)} :: RATE LIMIT EXCEEDED [Last update: ${new Date().toLocaleTimeString()}]`;
    updateStatus(store, link, message);
    return message;
  },

  recursionLimit(link: Link, store: Store, color?: boolean): string {
    const message = `✖  ${buildProductString(link, store)} :: CLOUDFLARE RETRY LIMIT REACHED, ABORT [Last update: ${new Date().toLocaleTimeString()}]`;
    updateStatus(store, link, message);
    return message;
  }
};

// Export initialization function to be called at startup
export const initializeStatusDisplay = (stores: Store[], products: {store: Store; link: Link}[]) => {
  initializeDisplay(stores, products);
};