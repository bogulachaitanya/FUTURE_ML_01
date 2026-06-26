/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SampleDataset {
  name: string;
  description: string;
  csvContent: string;
}

export const sampleDatasets: SampleDataset[] = [
  {
    name: "Enterprise Retail Electronics (120-Day Daily Sales)",
    description: "Daily transaction logs for high-volume retail electronics. Features weekend demand spikes, monthly cyclical patterns, and a 5% positive trend slope.",
    csvContent: `Date,Sales Quantity,Revenue,Product Name,Region,Category
2026-02-01,120,3120,NovaPro Laptop,North America,Electronics
2026-02-02,110,2860,NovaPro Laptop,North America,Electronics
2026-02-03,115,2990,NovaPro Laptop,North America,Electronics
2026-02-04,125,3250,NovaPro Laptop,North America,Electronics
2026-02-05,140,3640,NovaPro Laptop,North America,Electronics
2026-02-06,192,4992,NovaPro Laptop,North America,Electronics
2026-02-07,215,5590,NovaPro Laptop,North America,Electronics
2026-02-08,135,3510,NovaPro Laptop,North America,Electronics
2026-02-09,112,2912,NovaPro Laptop,North America,Electronics
2026-02-10,118,3068,NovaPro Laptop,North America,Electronics
2026-02-11,121,3146,NovaPro Laptop,North America,Electronics
2026-02-12,138,3588,NovaPro Laptop,North America,Electronics
2026-02-13,188,4888,NovaPro Laptop,North America,Electronics
2026-02-14,228,5928,NovaPro Laptop,North America,Electronics
2026-02-15,142,3692,NovaPro Laptop,North America,Electronics
2026-02-16,115,2990,NovaPro Laptop,North America,Electronics
2026-02-17,112,2912,NovaPro Laptop,North America,Electronics
2026-02-18,126,3276,NovaPro Laptop,North America,Electronics
2026-02-19,134,3484,NovaPro Laptop,North America,Electronics
2026-02-20,185,4810,NovaPro Laptop,North America,Electronics
2026-02-21,210,5460,NovaPro Laptop,North America,Electronics
2026-02-22,130,3380,NovaPro Laptop,North America,Electronics
2026-02-23,108,2808,NovaPro Laptop,North America,Electronics
2026-02-24,116,3016,NovaPro Laptop,North America,Electronics
2026-02-25,123,3198,NovaPro Laptop,North America,Electronics
2026-02-26,139,3614,NovaPro Laptop,North America,Electronics
2026-02-27,196,5096,NovaPro Laptop,North America,Electronics
2026-02-28,235,6110,NovaPro Laptop,North America,Electronics
2026-03-01,152,3952,NovaPro Laptop,North America,Electronics
2026-03-02,122,3172,NovaPro Laptop,North America,Electronics
2026-03-03,119,3094,NovaPro Laptop,North America,Electronics
2026-03-04,131,3406,NovaPro Laptop,North America,Electronics
2026-03-05,145,3770,NovaPro Laptop,North America,Electronics
2026-03-06,204,5304,NovaPro Laptop,North America,Electronics
2026-03-07,242,6292,NovaPro Laptop,North America,Electronics
2026-03-08,158,4108,NovaPro Laptop,North America,Electronics
2026-03-09,126,3276,NovaPro Laptop,North America,Electronics
2026-03-10,121,3146,NovaPro Laptop,North America,Electronics
2026-03-11,135,3510,NovaPro Laptop,North America,Electronics
2026-03-12,148,3848,NovaPro Laptop,North America,Electronics
2026-03-13,212,5512,NovaPro Laptop,North America,Electronics
2026-03-14,248,6448,NovaPro Laptop,North America,Electronics
2026-03-15,164,4264,NovaPro Laptop,North America,Electronics
2026-03-16,128,3328,NovaPro Laptop,North America,Electronics
2026-03-17,130,3380,NovaPro Laptop,North America,Electronics
2026-03-18,136,3536,NovaPro Laptop,North America,Electronics
2026-03-19,152,3952,NovaPro Laptop,North America,Electronics
2026-03-20,218,5668,NovaPro Laptop,North America,Electronics
2026-03-21,254,6604,NovaPro Laptop,North America,Electronics
2026-03-22,175,4550,NovaPro Laptop,North America,Electronics
2026-03-23,132,3432,NovaPro Laptop,North America,Electronics
2026-03-24,136,3536,NovaPro Laptop,North America,Electronics
2026-03-25,142,3692,NovaPro Laptop,North America,Electronics
2026-03-26,155,4030,NovaPro Laptop,North America,Electronics
2026-03-27,225,5850,NovaPro Laptop,North America,Electronics
2026-03-28,262,6812,NovaPro Laptop,North America,Electronics
2026-03-29,180,4680,NovaPro Laptop,North America,Electronics
2026-03-30,138,3588,NovaPro Laptop,North America,Electronics
2026-03-31,138,3588,NovaPro Laptop,North America,Electronics
2026-04-01,145,3770,NovaPro Laptop,North America,Electronics
2026-04-02,158,4108,NovaPro Laptop,North America,Electronics
2026-04-03,222,5772,NovaPro Laptop,North America,Electronics
2026-04-04,268,6968,NovaPro Laptop,North America,Electronics
2026-04-05,188,4888,NovaPro Laptop,North America,Electronics
2026-04-06,142,3692,NovaPro Laptop,North America,Electronics
2026-04-07,144,3744,NovaPro Laptop,North America,Electronics
2026-04-08,148,3848,NovaPro Laptop,North America,Electronics
2026-04-09,165,4290,NovaPro Laptop,North America,Electronics
2026-04-10,230,5980,NovaPro Laptop,North America,Electronics
2026-04-11,275,7150,NovaPro Laptop,North America,Electronics
2026-04-12,192,4992,NovaPro Laptop,North America,Electronics
2026-04-13,146,3796,NovaPro Laptop,North America,Electronics
2026-04-14,142,3692,NovaPro Laptop,North America,Electronics
2026-04-15,152,3952,NovaPro Laptop,North America,Electronics
2026-04-16,168,4368,NovaPro Laptop,North America,Electronics
2026-04-17,235,6110,NovaPro Laptop,North America,Electronics
2026-04-18,284,7384,NovaPro Laptop,North America,Electronics
2026-04-19,198,5148,NovaPro Laptop,North America,Electronics
2026-04-20,152,3952,NovaPro Laptop,North America,Electronics
2026-04-21,148,3848,NovaPro Laptop,North America,Electronics
2026-04-22,158,4108,NovaPro Laptop,North America,Electronics
2026-04-23,172,4472,NovaPro Laptop,North America,Electronics
2026-04-24,242,6292,NovaPro Laptop,North America,Electronics
2026-04-25,296,7696,NovaPro Laptop,North America,Electronics
2026-04-26,208,5408,NovaPro Laptop,North America,Electronics
2026-04-27,156,4056,NovaPro Laptop,North America,Electronics
2026-04-28,154,4004,NovaPro Laptop,North America,Electronics
2026-04-29,162,4212,NovaPro Laptop,North America,Electronics
2026-04-30,178,4628,NovaPro Laptop,North America,Electronics
2026-05-01,248,6448,NovaPro Laptop,North America,Electronics
2026-05-02,305,7930,NovaPro Laptop,North America,Electronics
2026-05-03,212,5512,NovaPro Laptop,North America,Electronics
2026-05-04,162,4212,NovaPro Laptop,North America,Electronics
2026-05-05,158,4108,NovaPro Laptop,North America,Electronics
2026-05-06,168,4368,NovaPro Laptop,North America,Electronics
2026-05-07,184,4784,NovaPro Laptop,North America,Electronics
2026-05-08,255,6630,NovaPro Laptop,North America,Electronics
2026-05-09,312,8112,NovaPro Laptop,North America,Electronics
2026-05-10,218,5668,NovaPro Laptop,North America,Electronics
2026-05-11,165,4290,NovaPro Laptop,North America,Electronics
2026-05-12,160,4160,NovaPro Laptop,North America,Electronics
2026-05-13,172,4472,NovaPro Laptop,North America,Electronics
2026-05-14,188,4888,NovaPro Laptop,North America,Electronics
2026-05-15,260,6760,NovaPro Laptop,North America,Electronics
2026-05-16,322,8372,NovaPro Laptop,North America,Electronics
2026-05-17,224,5824,NovaPro Laptop,North America,Electronics
2026-05-18,170,4420,NovaPro Laptop,North America,Electronics
2026-05-19,165,4290,NovaPro Laptop,North America,Electronics
2026-05-20,178,4628,NovaPro Laptop,North America,Electronics
2026-05-21,192,4992,NovaPro Laptop,North America,Electronics
2026-05-22,268,6968,NovaPro Laptop,North America,Electronics
2026-05-23,330,8580,NovaPro Laptop,North America,Electronics
2026-05-24,232,6032,NovaPro Laptop,North America,Electronics
2026-05-25,176,4576,NovaPro Laptop,North America,Electronics
2026-05-26,170,4420,NovaPro Laptop,North America,Electronics
2026-05-27,185,4810,NovaPro Laptop,North America,Electronics
2026-05-28,198,5148,NovaPro Laptop,North America,Electronics
2026-05-29,275,7150,NovaPro Laptop,North America,Electronics
2026-05-30,342,8892,NovaPro Laptop,North America,Electronics
2026-05-31,240,6240,NovaPro Laptop,North America,Electronics`
  },
  {
    name: "CPG Organic Goods (Weekly cyclic, slight seasonal variations)",
    description: "Ideal for fast-moving consumer packaged goods (CPG). Shows a high density of mid-week stock replenishment triggers.",
    csvContent: `Date,Sales Quantity,Revenue,Product Name,Region,Category
2026-03-01,45,1125,Aura Organic Soap,Europe,Organic Goods
2026-03-02,42,1050,Aura Organic Soap,Europe,Organic Goods
2026-03-03,38,950,Aura Organic Soap,Europe,Organic Goods
2026-03-04,52,1300,Aura Organic Soap,Europe,Organic Goods
2026-03-05,65,1625,Aura Organic Soap,Europe,Organic Goods
2026-03-06,78,1950,Aura Organic Soap,Europe,Organic Goods
2026-03-07,82,2050,Aura Organic Soap,Europe,Organic Goods
2026-03-08,48,1200,Aura Organic Soap,Europe,Organic Goods
2026-03-09,40,1000,Aura Organic Soap,Europe,Organic Goods
2026-03-10,41,1025,Aura Organic Soap,Europe,Organic Goods
2026-03-11,54,1350,Aura Organic Soap,Europe,Organic Goods
2026-03-12,62,1550,Aura Organic Soap,Europe,Organic Goods
2026-03-13,75,1875,Aura Organic Soap,Europe,Organic Goods
2026-03-14,84,2100,Aura Organic Soap,Europe,Organic Goods
2026-03-15,50,1250,Aura Organic Soap,Europe,Organic Goods
2026-03-16,42,1050,Aura Organic Soap,Europe,Organic Goods
2026-03-17,45,1125,Aura Organic Soap,Europe,Organic Goods
2026-03-18,52,1300,Aura Organic Soap,Europe,Organic Goods
2026-03-19,64,1600,Aura Organic Soap,Europe,Organic Goods
2026-03-20,77,1925,Aura Organic Soap,Europe,Organic Goods
2026-03-21,80,2000,Aura Organic Soap,Europe,Organic Goods
2026-03-22,51,1275,Aura Organic Soap,Europe,Organic Goods
2026-03-23,40,1000,Aura Organic Soap,Europe,Organic Goods
2026-03-24,43,1075,Aura Organic Soap,Europe,Organic Goods
2026-03-25,50,1250,Aura Organic Soap,Europe,Organic Goods
2026-03-26,61,1525,Aura Organic Soap,Europe,Organic Goods
2026-03-27,74,1850,Aura Organic Soap,Europe,Organic Goods
2026-03-28,81,2025,Aura Organic Soap,Europe,Organic Goods
2026-03-29,49,1225,Aura Organic Soap,Europe,Organic Goods
2026-03-30,41,1025,Aura Organic Soap,Europe,Organic Goods
2026-03-31,43,1075,Aura Organic Soap,Europe,Organic Goods
2026-04-01,53,1325,Aura Organic Soap,Europe,Organic Goods
2026-04-02,63,1575,Aura Organic Soap,Europe,Organic Goods
2026-04-03,79,1975,Aura Organic Soap,Europe,Organic Goods
2026-04-04,86,2150,Aura Organic Soap,Europe,Organic Goods
2026-04-05,52,1300,Aura Organic Soap,Europe,Organic Goods
2026-04-06,44,1100,Aura Organic Soap,Europe,Organic Goods
2026-04-07,46,1150,Aura Organic Soap,Europe,Organic Goods
2026-04-08,55,1375,Aura Organic Soap,Europe,Organic Goods
2026-04-09,66,1650,Aura Organic Soap,Europe,Organic Goods
2026-04-10,81,2025,Aura Organic Soap,Europe,Organic Goods
2026-04-11,88,2200,Aura Organic Soap,Europe,Organic Goods`
  }
];
