import React, { useEffect, useState } from 'react';

import { ResponsiveParallelCoordinates } from '@nivo/parallel-coordinates';
import api from '../../services/api';
import { notifyError } from '../../utils';

const mockData = [
    {
        "temp": 5,
        "cost": 58807,
        "color": "yellow",
        "target": "E",
        "volume": 5.321941979295482
    },
    {
        "temp": -8,
        "cost": 34625,
        "color": "red",
        "target": "B",
        "volume": 3.3033334415956253
    },
    {
        "temp": -2,
        "cost": 147770,
        "color": "yellow",
        "target": "E",
        "volume": 6.683797921830442
    },
    {
        "temp": 13,
        "cost": 170490,
        "color": "yellow",
        "target": "E",
        "volume": 6.905066342906753
    },
    {
        "temp": 21,
        "cost": 691,
        "color": "yellow",
        "target": "D",
        "volume": 2.8776993922231684
    },
    {
        "temp": 16,
        "cost": 283940,
        "color": "red",
        "target": "C",
        "volume": 1.379554327353493
    },
    {
        "temp": 33,
        "cost": 155236,
        "color": "yellow",
        "target": "A",
        "volume": 4.251604884776077
    },
    {
        "temp": 20,
        "cost": 8207,
        "color": "green",
        "target": "D",
        "volume": 4.479564483953799
    },
    {
        "temp": -6,
        "cost": 114529,
        "color": "red",
        "target": "B",
        "volume": 1.8720603830911144
    },
    {
        "temp": 22,
        "cost": 293070,
        "color": "green",
        "target": "B",
        "volume": 2.261305404636585
    },
    {
        "temp": 33,
        "cost": 378235,
        "color": "red",
        "target": "C",
        "volume": 4.205475439143493
    },
    {
        "temp": 27,
        "cost": 207235,
        "color": "red",
        "target": "C",
        "volume": 3.8910802414520815
    },
    {
        "temp": -5,
        "cost": 113137,
        "color": "green",
        "target": "C",
        "volume": 5.949829271003541
    },
    {
        "temp": 15,
        "cost": 52765,
        "color": "red",
        "target": "C",
        "volume": 7.559750477402666
    },
    {
        "temp": 0,
        "cost": 209237,
        "color": "red",
        "target": "C",
        "volume": 3.648616545790865
    },
    {
        "temp": 7,
        "cost": 28090,
        "color": "yellow",
        "target": "B",
        "volume": 0.28029924125952876
    },
    {
        "temp": -3,
        "cost": 5637,
        "color": "green",
        "target": "C",
        "volume": 2.525750609160229
    },
    {
        "temp": 29,
        "cost": 106498,
        "color": "red",
        "target": "D",
        "volume": 1.956578361981203
    },
    {
        "temp": 18,
        "cost": 282616,
        "color": "red",
        "target": "C",
        "volume": 6.826841609386102
    },
    {
        "temp": 3,
        "cost": 143018,
        "color": "red",
        "target": "E",
        "volume": 7.076827735635265
    },
    {
        "temp": 27,
        "cost": 43170,
        "color": "red",
        "target": "B",
        "volume": 1.9313187333275512
    },
    {
        "temp": 17,
        "cost": 289055,
        "color": "yellow",
        "target": "E",
        "volume": 3.1583750762060947
    },
    {
        "temp": 9,
        "cost": 267929,
        "color": "green",
        "target": "B",
        "volume": 4.265838067668579
    },
    {
        "temp": 34,
        "cost": 345086,
        "color": "green",
        "target": "B",
        "volume": 6.123592592679626
    },
    {
        "temp": 5,
        "cost": 223931,
        "color": "green",
        "target": "C",
        "volume": 4.92610410610559
    },
    {
        "temp": -8,
        "cost": 94978,
        "color": "green",
        "target": "B",
        "volume": 6.931372072486026
    },
    {
        "temp": 16,
        "cost": 165128,
        "color": "red",
        "target": "C",
        "volume": 6.2373806119040704
    },
    {
        "temp": -9,
        "cost": 307840,
        "color": "red",
        "target": "C",
        "volume": 4.0368845725873665
    },
    {
        "temp": 3,
        "cost": 205082,
        "color": "yellow",
        "target": "D",
        "volume": 0.520085936449749
    },
    {
        "temp": 31,
        "cost": 138096,
        "color": "green",
        "target": "C",
        "volume": 5.014867080083788
    },
    {
        "temp": -4,
        "cost": 389618,
        "color": "red",
        "target": "D",
        "volume": 4.8672693839055015
    },
    {
        "temp": 38,
        "cost": 278387,
        "color": "red",
        "target": "E",
        "volume": 2.6380329163876124
    },
    {
        "temp": 16,
        "cost": 250025,
        "color": "red",
        "target": "C",
        "volume": 1.5291005263876698
    },
    {
        "temp": 7,
        "cost": 116716,
        "color": "red",
        "target": "A",
        "volume": 1.300340548764103
    },
    {
        "temp": -9,
        "cost": 59274,
        "color": "yellow",
        "target": "D",
        "volume": 3.336085540853329
    },
    {
        "temp": 38,
        "cost": 210407,
        "color": "red",
        "target": "D",
        "volume": 5.933462175944979
    },
    {
        "temp": 28,
        "cost": 22355,
        "color": "yellow",
        "target": "E",
        "volume": 5.111189919665576
    },
    {
        "temp": 39,
        "cost": 237762,
        "color": "yellow",
        "target": "C",
        "volume": 3.02264121268494
    },
    {
        "temp": 28,
        "cost": 195233,
        "color": "yellow",
        "target": "A",
        "volume": 5.287676019969517
    },
    {
        "temp": 27,
        "cost": 187784,
        "color": "yellow",
        "target": "E",
        "volume": 4.64988098562534
    },
    {
        "temp": 19,
        "cost": 127395,
        "color": "red",
        "target": "B",
        "volume": 7.101014107120371
    },
    {
        "temp": 7,
        "cost": 264964,
        "color": "red",
        "target": "E",
        "volume": 1.4649014789124208
    },
    {
        "temp": 31,
        "cost": 223151,
        "color": "yellow",
        "target": "E",
        "volume": 3.6972215008443707
    },
    {
        "temp": 17,
        "cost": 108105,
        "color": "yellow",
        "target": "D",
        "volume": 7.3526630154476535
    },
    {
        "temp": 1,
        "cost": 157831,
        "color": "red",
        "target": "E",
        "volume": 2.2305559918026487
    },
    {
        "temp": 27,
        "cost": 381781,
        "color": "green",
        "target": "C",
        "volume": 7.102500643466261
    },
    {
        "temp": 23,
        "cost": 45837,
        "color": "yellow",
        "target": "B",
        "volume": 4.51928865193274
    },
    {
        "temp": 5,
        "cost": 261829,
        "color": "red",
        "target": "A",
        "volume": 1.9023102451844771
    },
    {
        "temp": 38,
        "cost": 72698,
        "color": "yellow",
        "target": "A",
        "volume": 1.7520793002779675
    },
    {
        "temp": 19,
        "cost": 6828,
        "color": "yellow",
        "target": "C",
        "volume": 4.214565814735924
    },
    {
        "temp": 15,
        "cost": 217125,
        "color": "green",
        "target": "A",
        "volume": 5.3593389765152395
    },
    {
        "temp": 36,
        "cost": 334103,
        "color": "red",
        "target": "B",
        "volume": 2.613052674532468
    },
    {
        "temp": 34,
        "cost": 291564,
        "color": "red",
        "target": "D",
        "volume": 1.8075022924086492
    },
    {
        "temp": -5,
        "cost": 273061,
        "color": "green",
        "target": "B",
        "volume": 7.16493099080959
    },
    {
        "temp": 29,
        "cost": 101732,
        "color": "red",
        "target": "E",
        "volume": 3.1860684244952613
    },
    {
        "temp": -1,
        "cost": 11862,
        "color": "red",
        "target": "D",
        "volume": 1.8216753482903825
    },
    {
        "temp": -6,
        "cost": 360317,
        "color": "green",
        "target": "E",
        "volume": 0.8366073794333246
    },
    {
        "temp": -1,
        "cost": 386899,
        "color": "red",
        "target": "C",
        "volume": 1.6232145674670828
    },
    {
        "temp": 34,
        "cost": 217781,
        "color": "green",
        "target": "C",
        "volume": 4.9956558131601385
    },
    {
        "temp": 27,
        "cost": 161404,
        "color": "green",
        "target": "A",
        "volume": 0.6071831839153382
    },
    {
        "temp": 11,
        "cost": 174341,
        "color": "green",
        "target": "C",
        "volume": 0.4127631192422333
    },
    {
        "temp": 20,
        "cost": 165352,
        "color": "red",
        "target": "D",
        "volume": 3.588908411058806
    },
    {
        "temp": 2,
        "cost": 133260,
        "color": "red",
        "target": "B",
        "volume": 0.33494482916993107
    },
    {
        "temp": 1,
        "cost": 135216,
        "color": "yellow",
        "target": "D",
        "volume": 1.2813523417049886
    },
    {
        "temp": 28,
        "cost": 308324,
        "color": "green",
        "target": "D",
        "volume": 6.081375573548253
    },
    {
        "temp": 33,
        "cost": 49685,
        "color": "yellow",
        "target": "C",
        "volume": 6.810273427168966
    },
    {
        "temp": 0,
        "cost": 71023,
        "color": "green",
        "target": "C",
        "volume": 1.0421885833094768
    },
    {
        "temp": 26,
        "cost": 74464,
        "color": "yellow",
        "target": "C",
        "volume": 3.8704278011487254
    },
    {
        "temp": 30,
        "cost": 50258,
        "color": "green",
        "target": "E",
        "volume": 3.42189726775578
    },
    {
        "temp": 10,
        "cost": 108857,
        "color": "red",
        "target": "A",
        "volume": 5.848181734356852
    },
    {
        "temp": 14,
        "cost": 141680,
        "color": "yellow",
        "target": "A",
        "volume": 3.18116149083804
    },
    {
        "temp": 0,
        "cost": 255025,
        "color": "yellow",
        "target": "C",
        "volume": 2.0575927751975005
    },
    {
        "temp": -9,
        "cost": 255577,
        "color": "red",
        "target": "C",
        "volume": 5.209570811775511
    },
    {
        "temp": 18,
        "cost": 80651,
        "color": "yellow",
        "target": "C",
        "volume": 0.9452688264765643
    },
    {
        "temp": 8,
        "cost": 307324,
        "color": "red",
        "target": "C",
        "volume": 4.904096904343728
    },
    {
        "temp": 0,
        "cost": 186251,
        "color": "yellow",
        "target": "E",
        "volume": 2.7238747857619807
    },
    {
        "temp": 5,
        "cost": 304717,
        "color": "yellow",
        "target": "B",
        "volume": 4.131650737493368
    },
    {
        "temp": 25,
        "cost": 159260,
        "color": "green",
        "target": "C",
        "volume": 5.0172377831546005
    },
    {
        "temp": 8,
        "cost": 306130,
        "color": "green",
        "target": "C",
        "volume": 5.9029154233174985
    },
    {
        "temp": 34,
        "cost": 149618,
        "color": "green",
        "target": "D",
        "volume": 2.7385490331781117
    },
    {
        "temp": 19,
        "cost": 175760,
        "color": "green",
        "target": "B",
        "volume": 3.668592725309515
    },
    {
        "temp": 27,
        "cost": 387860,
        "color": "green",
        "target": "D",
        "volume": 3.8412838184557576
    },
    {
        "temp": 18,
        "cost": 290915,
        "color": "green",
        "target": "E",
        "volume": 1.9707554958342612
    },
    {
        "temp": 25,
        "cost": 220615,
        "color": "red",
        "target": "E",
        "volume": 2.6911593833438987
    },
    {
        "temp": 20,
        "cost": 311454,
        "color": "green",
        "target": "B",
        "volume": 2.9703898598235345
    },
    {
        "temp": -7,
        "cost": 246270,
        "color": "green",
        "target": "B",
        "volume": 1.4529086313768782
    },
    {
        "temp": 20,
        "cost": 48335,
        "color": "yellow",
        "target": "C",
        "volume": 7.395850896861749
    },
    {
        "temp": 33,
        "cost": 142222,
        "color": "red",
        "target": "D",
        "volume": 0.7080156239129243
    },
    {
        "temp": 22,
        "cost": 398161,
        "color": "green",
        "target": "B",
        "volume": 6.516875534880299
    },
    {
        "temp": 12,
        "cost": 323156,
        "color": "yellow",
        "target": "B",
        "volume": 4.221589222945245
    },
    {
        "temp": 11,
        "cost": 294127,
        "color": "yellow",
        "target": "E",
        "volume": 7.1733293256530555
    },
    {
        "temp": 27,
        "cost": 330869,
        "color": "red",
        "target": "C",
        "volume": 6.3461312327497845
    },
    {
        "temp": 11,
        "cost": 341363,
        "color": "green",
        "target": "D",
        "volume": 1.237801132456351
    },
    {
        "temp": 19,
        "cost": 327785,
        "color": "yellow",
        "target": "B",
        "volume": 7.5876135597280046
    },
    {
        "temp": 27,
        "cost": 208682,
        "color": "red",
        "target": "E",
        "volume": 4.78060812510687
    },
    {
        "temp": 21,
        "cost": 177464,
        "color": "green",
        "target": "C",
        "volume": 0.5245310088413189
    },
    {
        "temp": -5,
        "cost": 396654,
        "color": "red",
        "target": "D",
        "volume": 5.55926489264916
    },
    {
        "temp": 40,
        "cost": 305687,
        "color": "green",
        "target": "B",
        "volume": 4.988775463913082
    },
    {
        "temp": 32,
        "cost": 43381,
        "color": "red",
        "target": "C",
        "volume": 3.0794822565231015
    },
    {
        "temp": 27,
        "cost": 92080,
        "color": "red",
        "target": "C",
        "volume": 5.2326193900840465
    },
    {
        "temp": -5,
        "cost": 341170,
        "color": "red",
        "target": "E",
        "volume": 5.254169093961822
    },
    {
        "temp": 6,
        "cost": 192050,
        "color": "yellow",
        "target": "B",
        "volume": 2.150354768106374
    },
    {
        "temp": 34,
        "cost": 138965,
        "color": "yellow",
        "target": "B",
        "volume": 3.6822418504537793
    },
    {
        "temp": 8,
        "cost": 20878,
        "color": "red",
        "target": "D",
        "volume": 5.393627640848701
    },
    {
        "temp": 30,
        "cost": 341970,
        "color": "red",
        "target": "A",
        "volume": 1.2267293618436554
    },
    {
        "temp": 35,
        "cost": 212335,
        "color": "yellow",
        "target": "E",
        "volume": 7.380518318272978
    },
    {
        "temp": -6,
        "cost": 251062,
        "color": "green",
        "target": "D",
        "volume": 3.8502151058596024
    },
    {
        "temp": 26,
        "cost": 115787,
        "color": "green",
        "target": "C",
        "volume": 1.1658768389520535
    },
    {
        "temp": 26,
        "cost": 113682,
        "color": "yellow",
        "target": "B",
        "volume": 2.889522918776554
    },
    {
        "temp": 16,
        "cost": 256112,
        "color": "yellow",
        "target": "D",
        "volume": 4.551491944220468
    },
    {
        "temp": 3,
        "cost": 93960,
        "color": "red",
        "target": "B",
        "volume": 6.826102282994691
    },
    {
        "temp": 15,
        "cost": 196164,
        "color": "green",
        "target": "C",
        "volume": 4.010367751054433
    },
    {
        "temp": 9,
        "cost": 76465,
        "color": "green",
        "target": "E",
        "volume": 4.890303968905197
    },
    {
        "temp": 24,
        "cost": 155429,
        "color": "yellow",
        "target": "D",
        "volume": 3.2340552237057105
    },
    {
        "temp": 7,
        "cost": 323324,
        "color": "green",
        "target": "B",
        "volume": 3.0859463428542275
    },
    {
        "temp": -4,
        "cost": 195865,
        "color": "yellow",
        "target": "D",
        "volume": 7.38581181031987
    },
    {
        "temp": 38,
        "cost": 284044,
        "color": "red",
        "target": "D",
        "volume": 6.024667111009943
    },
    {
        "temp": 1,
        "cost": 337317,
        "color": "green",
        "target": "C",
        "volume": 7.201556116181103
    },
    {
        "temp": 39,
        "cost": 115826,
        "color": "green",
        "target": "A",
        "volume": 2.102400670545311
    },
    {
        "temp": -5,
        "cost": 351353,
        "color": "red",
        "target": "A",
        "volume": 5.3457782097465465
    },
    {
        "temp": 18,
        "cost": 26697,
        "color": "green",
        "target": "D",
        "volume": 7.3624151735609855
    },
    {
        "temp": 28,
        "cost": 368914,
        "color": "yellow",
        "target": "D",
        "volume": 2.6126099184385336
    },
    {
        "temp": 0,
        "cost": 215595,
        "color": "yellow",
        "target": "C",
        "volume": 2.4159316750016275
    },
    {
        "temp": 10,
        "cost": 267418,
        "color": "green",
        "target": "D",
        "volume": 3.429879898758505
    },
    {
        "temp": 33,
        "cost": 116036,
        "color": "green",
        "target": "D",
        "volume": 2.706813768824967
    },
    {
        "temp": 25,
        "cost": 241169,
        "color": "yellow",
        "target": "E",
        "volume": 0.431519971906829
    },
    {
        "temp": 22,
        "cost": 357357,
        "color": "green",
        "target": "E",
        "volume": 2.9164335962609615
    },
    {
        "temp": 9,
        "cost": 156192,
        "color": "yellow",
        "target": "E",
        "volume": 1.8190835542917463
    },
    {
        "temp": 21,
        "cost": 214872,
        "color": "red",
        "target": "E",
        "volume": 5.018187907233267
    },
    {
        "temp": -4,
        "cost": 95993,
        "color": "yellow",
        "target": "D",
        "volume": 4.495895387206246
    },
    {
        "temp": 39,
        "cost": 329024,
        "color": "yellow",
        "target": "D",
        "volume": 5.1655197997519
    },
    {
        "temp": 6,
        "cost": 397493,
        "color": "yellow",
        "target": "B",
        "volume": 6.8619467153982905
    },
    {
        "temp": 17,
        "cost": 233934,
        "color": "green",
        "target": "C",
        "volume": 4.149083502288966
    },
    {
        "temp": 30,
        "cost": 177486,
        "color": "yellow",
        "target": "C",
        "volume": 5.510793243197211
    },
    {
        "temp": -2,
        "cost": 278119,
        "color": "green",
        "target": "B",
        "volume": 6.844207910927034
    },
    {
        "temp": 13,
        "cost": 382759,
        "color": "green",
        "target": "D",
        "volume": 7.0075086763033
    },
    {
        "temp": 22,
        "cost": 46737,
        "color": "yellow",
        "target": "D",
        "volume": 0.7468822794713552
    },
    {
        "temp": 36,
        "cost": 86088,
        "color": "green",
        "target": "B",
        "volume": 4.563915407327437
    },
    {
        "temp": -9,
        "cost": 49201,
        "color": "red",
        "target": "C",
        "volume": 2.603456961681983
    },
    {
        "temp": 10,
        "cost": 183935,
        "color": "green",
        "target": "C",
        "volume": 2.0230286295773725
    },
    {
        "temp": 14,
        "cost": 336073,
        "color": "green",
        "target": "E",
        "volume": 3.2091977751233056
    },
    {
        "temp": -1,
        "cost": 33381,
        "color": "yellow",
        "target": "E",
        "volume": 3.9538449136412086
    },
    {
        "temp": -6,
        "cost": 379713,
        "color": "red",
        "target": "B",
        "volume": 4.224757637364232
    },
    {
        "temp": 40,
        "cost": 236092,
        "color": "green",
        "target": "E",
        "volume": 7.354692565742494
    },
    {
        "temp": 8,
        "cost": 243005,
        "color": "yellow",
        "target": "A",
        "volume": 7.499026101916619
    },
    {
        "temp": 38,
        "cost": 214711,
        "color": "green",
        "target": "A",
        "volume": 5.963426359143822
    },
    {
        "temp": 15,
        "cost": 204394,
        "color": "green",
        "target": "B",
        "volume": 5.424970608666682
    },
    {
        "temp": -10,
        "cost": 81129,
        "color": "yellow",
        "target": "C",
        "volume": 3.7348299192098096
    },
    {
        "temp": 34,
        "cost": 290282,
        "color": "green",
        "target": "C",
        "volume": 5.511362483872749
    },
    {
        "temp": 5,
        "cost": 68234,
        "color": "green",
        "target": "A",
        "volume": 4.386915911807933
    },
    {
        "temp": -10,
        "cost": 82566,
        "color": "red",
        "target": "E",
        "volume": 0.9751478842928996
    },
    {
        "temp": 14,
        "cost": 58511,
        "color": "green",
        "target": "E",
        "volume": 3.3141077608522456
    },
    {
        "temp": 23,
        "cost": 129308,
        "color": "yellow",
        "target": "E",
        "volume": 3.962170080059808
    },
    {
        "temp": 3,
        "cost": 24712,
        "color": "yellow",
        "target": "D",
        "volume": 0.5480148581066187
    },
    {
        "temp": 1,
        "cost": 130327,
        "color": "red",
        "target": "D",
        "volume": 6.642390602890055
    },
    {
        "temp": 5,
        "cost": 65489,
        "color": "green",
        "target": "D",
        "volume": 3.5115003833787144
    },
    {
        "temp": 36,
        "cost": 4937,
        "color": "red",
        "target": "B",
        "volume": 7.428393190992064
    },
    {
        "temp": 21,
        "cost": 159946,
        "color": "green",
        "target": "D",
        "volume": 7.388951403270214
    },
    {
        "temp": 40,
        "cost": 290602,
        "color": "red",
        "target": "C",
        "volume": 0.4232010231712121
    },
    {
        "temp": 39,
        "cost": 58466,
        "color": "red",
        "target": "E",
        "volume": 5.919290839845862
    },
    {
        "temp": 17,
        "cost": 182161,
        "color": "red",
        "target": "E",
        "volume": 4.005617125115251
    },
    {
        "temp": 35,
        "cost": 114066,
        "color": "yellow",
        "target": "C",
        "volume": 6.576906074311184
    },
    {
        "temp": 3,
        "cost": 272075,
        "color": "red",
        "target": "C",
        "volume": 2.4152066847568494
    },
    {
        "temp": 19,
        "cost": 203790,
        "color": "green",
        "target": "B",
        "volume": 3.398030791675107
    },
    {
        "temp": 37,
        "cost": 251615,
        "color": "green",
        "target": "B",
        "volume": 5.193594477358573
    },
    {
        "temp": 14,
        "cost": 287494,
        "color": "red",
        "target": "D",
        "volume": 5.9820302467428395
    },
    {
        "temp": 32,
        "cost": 226695,
        "color": "green",
        "target": "B",
        "volume": 3.5034312124541143
    },
    {
        "temp": 6,
        "cost": 66906,
        "color": "red",
        "target": "B",
        "volume": 4.842547760142023
    },
    {
        "temp": 17,
        "cost": 289671,
        "color": "red",
        "target": "D",
        "volume": 6.170807330103179
    },
    {
        "temp": 29,
        "cost": 235307,
        "color": "red",
        "target": "C",
        "volume": 4.501027536221146
    },
    {
        "temp": 38,
        "cost": 12275,
        "color": "red",
        "target": "E",
        "volume": 2.662300811495472
    },
    {
        "temp": 5,
        "cost": 208890,
        "color": "red",
        "target": "B",
        "volume": 4.866047065772308
    },
    {
        "temp": 2,
        "cost": 139887,
        "color": "yellow",
        "target": "B",
        "volume": 5.286777870016326
    },
    {
        "temp": 9,
        "cost": 217557,
        "color": "yellow",
        "target": "E",
        "volume": 5.180929552719755
    },
    {
        "temp": 22,
        "cost": 58051,
        "color": "green",
        "target": "C",
        "volume": 0.7052160536731773
    },
    {
        "temp": 14,
        "cost": 270266,
        "color": "yellow",
        "target": "C",
        "volume": 5.338118367892246
    },
    {
        "temp": 39,
        "cost": 196264,
        "color": "green",
        "target": "B",
        "volume": 6.769923292826139
    },
    {
        "temp": 10,
        "cost": 124194,
        "color": "yellow",
        "target": "A",
        "volume": 3.4783681198222136
    },
    {
        "temp": 11,
        "cost": 3641,
        "color": "red",
        "target": "C",
        "volume": 1.7123328814182885
    },
    {
        "temp": 4,
        "cost": 54078,
        "color": "yellow",
        "target": "D",
        "volume": 4.821005117298263
    },
    {
        "temp": 16,
        "cost": 179523,
        "color": "green",
        "target": "D",
        "volume": 6.981703124725441
    },
    {
        "temp": 17,
        "cost": 106850,
        "color": "yellow",
        "target": "E",
        "volume": 1.187660174104572
    },
    {
        "temp": 24,
        "cost": 335035,
        "color": "red",
        "target": "A",
        "volume": 6.90140576843073
    },
    {
        "temp": 1,
        "cost": 72348,
        "color": "green",
        "target": "E",
        "volume": 2.685295368556872
    },
    {
        "temp": 12,
        "cost": 376559,
        "color": "red",
        "target": "E",
        "volume": 5.273359563554334
    },
    {
        "temp": 29,
        "cost": 63155,
        "color": "green",
        "target": "A",
        "volume": 3.148316978417464
    },
    {
        "temp": -5,
        "cost": 33894,
        "color": "green",
        "target": "D",
        "volume": 3.232917004159453
    },
    {
        "temp": 28,
        "cost": 292430,
        "color": "red",
        "target": "D",
        "volume": 7.125055217816632
    },
    {
        "temp": 17,
        "cost": 350514,
        "color": "green",
        "target": "C",
        "volume": 2.4388548071793896
    },
    {
        "temp": -4,
        "cost": 181717,
        "color": "green",
        "target": "A",
        "volume": 4.417675268223148
    },
    {
        "temp": 36,
        "cost": 356392,
        "color": "yellow",
        "target": "E",
        "volume": 4.349908817539475
    },
    {
        "temp": 28,
        "cost": 3835,
        "color": "red",
        "target": "D",
        "volume": 6.2173590810656405
    },
    {
        "temp": 39,
        "cost": 144852,
        "color": "yellow",
        "target": "A",
        "volume": 3.846835620985898
    },
    {
        "temp": -4,
        "cost": 225766,
        "color": "green",
        "target": "B",
        "volume": 7.001442729229609
    },
    {
        "temp": 12,
        "cost": 35255,
        "color": "green",
        "target": "C",
        "volume": 7.003985004190861
    },
    {
        "temp": 20,
        "cost": 284054,
        "color": "green",
        "target": "C",
        "volume": 2.7048374390213823
    },
    {
        "temp": 25,
        "cost": 78568,
        "color": "red",
        "target": "D",
        "volume": 0.8372293535014732
    },
    {
        "temp": 31,
        "cost": 66596,
        "color": "green",
        "target": "B",
        "volume": 2.4335015122925614
    },
    {
        "temp": 0,
        "cost": 322144,
        "color": "green",
        "target": "A",
        "volume": 1.6775845381085526
    },
    {
        "temp": 30,
        "cost": 265547,
        "color": "green",
        "target": "D",
        "volume": 6.673413785932698
    },
    {
        "temp": 38,
        "cost": 83146,
        "color": "green",
        "target": "C",
        "volume": 1.4416787098238693
    },
    {
        "temp": -3,
        "cost": 242849,
        "color": "yellow",
        "target": "B",
        "volume": 3.3716734815133313
    },
    {
        "temp": 14,
        "cost": 282504,
        "color": "green",
        "target": "C",
        "volume": 5.016814092225511
    },
    {
        "temp": 39,
        "cost": 180237,
        "color": "yellow",
        "target": "A",
        "volume": 5.909374838805513
    },
    {
        "temp": 14,
        "cost": 47618,
        "color": "yellow",
        "target": "E",
        "volume": 1.2824971303595967
    },
    {
        "temp": 10,
        "cost": 78819,
        "color": "yellow",
        "target": "D",
        "volume": 1.2613810598411255
    },
    {
        "temp": 39,
        "cost": 310500,
        "color": "green",
        "target": "E",
        "volume": 6.9984089489086765
    },
    {
        "temp": 37,
        "cost": 4221,
        "color": "red",
        "target": "A",
        "volume": 0.622666367056474
    },
    {
        "temp": 29,
        "cost": 193340,
        "color": "red",
        "target": "A",
        "volume": 2.355128026191471
    },
    {
        "temp": 4,
        "cost": 320665,
        "color": "green",
        "target": "B",
        "volume": 2.75922867537878
    },
    {
        "temp": -10,
        "cost": 42015,
        "color": "yellow",
        "target": "D",
        "volume": 2.3672297444531933
    },
    {
        "temp": 15,
        "cost": 372563,
        "color": "red",
        "target": "C",
        "volume": 4.496683445208397
    },
    {
        "temp": 27,
        "cost": 373706,
        "color": "green",
        "target": "A",
        "volume": 3.079764912380355
    },
    {
        "temp": 32,
        "cost": 298837,
        "color": "red",
        "target": "E",
        "volume": 0.5069702456802035
    },
    {
        "temp": -10,
        "cost": 327106,
        "color": "red",
        "target": "A",
        "volume": 1.9339762893805228
    },
    {
        "temp": -7,
        "cost": 375291,
        "color": "green",
        "target": "C",
        "volume": 1.0875090946602832
    },
    {
        "temp": 18,
        "cost": 388160,
        "color": "yellow",
        "target": "C",
        "volume": 2.688986072273942
    },
    {
        "temp": 40,
        "cost": 319384,
        "color": "red",
        "target": "B",
        "volume": 5.851606876883528
    },
    {
        "temp": 15,
        "cost": 236154,
        "color": "green",
        "target": "D",
        "volume": 0.5756002705752334
    },
    {
        "temp": -7,
        "cost": 362659,
        "color": "yellow",
        "target": "B",
        "volume": 5.884545632018979
    },
    {
        "temp": 4,
        "cost": 146213,
        "color": "red",
        "target": "D",
        "volume": 2.0296425323989458
    },
    {
        "temp": 32,
        "cost": 382952,
        "color": "yellow",
        "target": "E",
        "volume": 5.913685422006622
    },
    {
        "temp": -9,
        "cost": 86069,
        "color": "red",
        "target": "B",
        "volume": 4.430481315754635
    },
    {
        "temp": 28,
        "cost": 146841,
        "color": "yellow",
        "target": "A",
        "volume": 7.232831571790592
    },
    {
        "temp": -10,
        "cost": 253450,
        "color": "yellow",
        "target": "D",
        "volume": 3.1253258484897257
    },
    {
        "temp": 37,
        "cost": 320989,
        "color": "red",
        "target": "C",
        "volume": 4.078056954843316
    },
    {
        "temp": 11,
        "cost": 217326,
        "color": "yellow",
        "target": "D",
        "volume": 1.7416745671419414
    },
    {
        "temp": 10,
        "cost": 228747,
        "color": "green",
        "target": "D",
        "volume": 1.1501767606715132
    },
    {
        "temp": 13,
        "cost": 254089,
        "color": "green",
        "target": "A",
        "volume": 6.658386029273171
    },
    {
        "temp": 0,
        "cost": 326159,
        "color": "yellow",
        "target": "E",
        "volume": 1.6150297361809332
    },
    {
        "temp": -1,
        "cost": 262305,
        "color": "red",
        "target": "D",
        "volume": 0.5076213489115302
    },
    {
        "temp": 29,
        "cost": 395822,
        "color": "red",
        "target": "B",
        "volume": 0.20069257582615102
    },
    {
        "temp": -4,
        "cost": 107610,
        "color": "green",
        "target": "A",
        "volume": 0.6951357228984412
    },
    {
        "temp": 29,
        "cost": 214891,
        "color": "yellow",
        "target": "D",
        "volume": 0.6622356729902186
    },
    {
        "temp": 20,
        "cost": 395423,
        "color": "green",
        "target": "A",
        "volume": 5.961300766460354
    },
    {
        "temp": 7,
        "cost": 346771,
        "color": "green",
        "target": "A",
        "volume": 3.93304090956602
    },
    {
        "temp": 2,
        "cost": 281312,
        "color": "yellow",
        "target": "C",
        "volume": 7.106523473354934
    },
    {
        "temp": 4,
        "cost": 254544,
        "color": "red",
        "target": "C",
        "volume": 3.789071035304664
    },
    {
        "temp": 35,
        "cost": 99065,
        "color": "red",
        "target": "C",
        "volume": 3.951317332794089
    },
    {
        "temp": -7,
        "cost": 132589,
        "color": "red",
        "target": "B",
        "volume": 1.2496749543412446
    },
    {
        "temp": 6,
        "cost": 78127,
        "color": "green",
        "target": "D",
        "volume": 5.50193669434237
    },
    {
        "temp": 10,
        "cost": 70977,
        "color": "red",
        "target": "A",
        "volume": 3.341251692990304
    },
    {
        "temp": -7,
        "cost": 162623,
        "color": "red",
        "target": "D",
        "volume": 7.195293024495036
    },
    {
        "temp": -3,
        "cost": 150419,
        "color": "green",
        "target": "E",
        "volume": 5.560124248350656
    },
    {
        "temp": 27,
        "cost": 119135,
        "color": "yellow",
        "target": "A",
        "volume": 0.2600102788298488
    },
    {
        "temp": 11,
        "cost": 360862,
        "color": "red",
        "target": "B",
        "volume": 5.806677188430329
    },
    {
        "temp": -1,
        "cost": 159568,
        "color": "red",
        "target": "B",
        "volume": 2.50053368422361
    },
    {
        "temp": 39,
        "cost": 246545,
        "color": "green",
        "target": "B",
        "volume": 5.5971057596544025
    },
    {
        "temp": 37,
        "cost": 176770,
        "color": "red",
        "target": "B",
        "volume": 6.45030460142627
    },
    {
        "temp": 24,
        "cost": 38163,
        "color": "yellow",
        "target": "D",
        "volume": 7.353953744695731
    },
    {
        "temp": 30,
        "cost": 337105,
        "color": "red",
        "target": "C",
        "volume": 5.629244537115589
    },
    {
        "temp": 30,
        "cost": 180154,
        "color": "green",
        "target": "E",
        "volume": 5.664928033900199
    },
    {
        "temp": 27,
        "cost": 260044,
        "color": "green",
        "target": "A",
        "volume": 7.22955008257031
    },
    {
        "temp": 23,
        "cost": 158012,
        "color": "red",
        "target": "D",
        "volume": 2.245821722421044
    },
    {
        "temp": 7,
        "cost": 274683,
        "color": "yellow",
        "target": "B",
        "volume": 1.1719977266072812
    },
    {
        "temp": 23,
        "cost": 42082,
        "color": "green",
        "target": "A",
        "volume": 6.085318106417848
    },
    {
        "temp": 35,
        "cost": 68986,
        "color": "red",
        "target": "A",
        "volume": 3.1423504490079686
    },
    {
        "temp": 6,
        "cost": 277126,
        "color": "yellow",
        "target": "C",
        "volume": 4.384079826033652
    },
    {
        "temp": 6,
        "cost": 182005,
        "color": "green",
        "target": "A",
        "volume": 3.499506207673529
    },
    {
        "temp": 11,
        "cost": 374171,
        "color": "red",
        "target": "C",
        "volume": 1.585682299975851
    },
    {
        "temp": 15,
        "cost": 343854,
        "color": "green",
        "target": "D",
        "volume": 1.6132462564945964
    },
    {
        "temp": 29,
        "cost": 270946,
        "color": "yellow",
        "target": "A",
        "volume": 2.374923164369526
    },
    {
        "temp": 4,
        "cost": 192266,
        "color": "red",
        "target": "E",
        "volume": 6.7610869564582865
    },
    {
        "temp": 19,
        "cost": 190921,
        "color": "yellow",
        "target": "B",
        "volume": 1.249537532633321
    },
    {
        "temp": 18,
        "cost": 86112,
        "color": "red",
        "target": "E",
        "volume": 5.37274263159801
    },
    {
        "temp": 1,
        "cost": 362677,
        "color": "red",
        "target": "D",
        "volume": 7.021642631262864
    },
    {
        "temp": -5,
        "cost": 238400,
        "color": "green",
        "target": "D",
        "volume": 6.28458238993985
    },
    {
        "temp": 8,
        "cost": 308849,
        "color": "yellow",
        "target": "A",
        "volume": 3.9435848005482335
    },
    {
        "temp": 27,
        "cost": 254809,
        "color": "green",
        "target": "E",
        "volume": 7.358691089185935
    },
    {
        "temp": 1,
        "cost": 371753,
        "color": "green",
        "target": "E",
        "volume": 0.46314373455024554
    },
    {
        "temp": 24,
        "cost": 175679,
        "color": "yellow",
        "target": "B",
        "volume": 3.0687092220683034
    },
    {
        "temp": 1,
        "cost": 186162,
        "color": "green",
        "target": "B",
        "volume": 5.643269644039027
    },
    {
        "temp": 20,
        "cost": 267143,
        "color": "red",
        "target": "C",
        "volume": 4.9722353441176885
    },
    {
        "temp": -3,
        "cost": 171495,
        "color": "green",
        "target": "E",
        "volume": 6.357742025579494
    },
    {
        "temp": 40,
        "cost": 155022,
        "color": "yellow",
        "target": "C",
        "volume": 3.146248447487898
    },
    {
        "temp": 31,
        "cost": 365994,
        "color": "red",
        "target": "B",
        "volume": 6.2896294416198
    },
    {
        "temp": 40,
        "cost": 205806,
        "color": "green",
        "target": "C",
        "volume": 4.2725691023108245
    },
    {
        "temp": 24,
        "cost": 315704,
        "color": "yellow",
        "target": "C",
        "volume": 2.5600925534670167
    },
    {
        "temp": 4,
        "cost": 274997,
        "color": "yellow",
        "target": "E",
        "volume": 4.388716121525936
    },
    {
        "temp": 38,
        "cost": 357729,
        "color": "green",
        "target": "E",
        "volume": 4.48406352852534
    },
    {
        "temp": 13,
        "cost": 352723,
        "color": "yellow",
        "target": "A",
        "volume": 0.6516225526883592
    },
    {
        "temp": -7,
        "cost": 349730,
        "color": "red",
        "target": "A",
        "volume": 2.6081531773669933
    },
    {
        "temp": 4,
        "cost": 392845,
        "color": "red",
        "target": "E",
        "volume": 2.8190051175923516
    },
    {
        "temp": 5,
        "cost": 231894,
        "color": "yellow",
        "target": "A",
        "volume": 2.2004229848261874
    },
    {
        "temp": 18,
        "cost": 179646,
        "color": "green",
        "target": "B",
        "volume": 2.9862272323455485
    },
    {
        "temp": 25,
        "cost": 72915,
        "color": "yellow",
        "target": "D",
        "volume": 7.224874089757983
    },
    {
        "temp": 39,
        "cost": 372843,
        "color": "yellow",
        "target": "D",
        "volume": 1.5798783869697663
    },
    {
        "temp": 40,
        "cost": 264675,
        "color": "yellow",
        "target": "E",
        "volume": 6.520881403421474
    },
    {
        "temp": 26,
        "cost": 396173,
        "color": "green",
        "target": "D",
        "volume": 4.143126646262884
    },
    {
        "temp": 18,
        "cost": 331924,
        "color": "yellow",
        "target": "A",
        "volume": 5.000813629416528
    },
    {
        "temp": 37,
        "cost": 331934,
        "color": "yellow",
        "target": "A",
        "volume": 2.0288727317520987
    },
    {
        "temp": 29,
        "cost": 294264,
        "color": "red",
        "target": "B",
        "volume": 5.143231404648039
    },
    {
        "temp": 2,
        "cost": 129443,
        "color": "red",
        "target": "E",
        "volume": 2.3783946863965872
    },
    {
        "temp": 5,
        "cost": 323957,
        "color": "green",
        "target": "E",
        "volume": 7.2839541336207825
    },
    {
        "temp": 31,
        "cost": 35056,
        "color": "red",
        "target": "C",
        "volume": 0.22166891175448344
    },
    {
        "temp": -7,
        "cost": 110728,
        "color": "red",
        "target": "E",
        "volume": 5.939293361360448
    },
    {
        "temp": 3,
        "cost": 123128,
        "color": "red",
        "target": "A",
        "volume": 5.388895200482423
    },
    {
        "temp": -3,
        "cost": 14018,
        "color": "green",
        "target": "C",
        "volume": 1.2779833225632569
    },
    {
        "temp": 27,
        "cost": 352453,
        "color": "green",
        "target": "D",
        "volume": 0.9625616126848868
    },
    {
        "temp": 27,
        "cost": 20362,
        "color": "green",
        "target": "B",
        "volume": 4.165546062922002
    },
    {
        "temp": 26,
        "cost": 115353,
        "color": "green",
        "target": "C",
        "volume": 6.479972670071983
    },
    {
        "temp": 25,
        "cost": 181948,
        "color": "red",
        "target": "B",
        "volume": 7.3976418495215475
    },
    {
        "temp": -7,
        "cost": 116786,
        "color": "green",
        "target": "B",
        "volume": 1.8720782209840372
    },
    {
        "temp": 5,
        "cost": 287881,
        "color": "red",
        "target": "D",
        "volume": 4.291914404125557
    },
    {
        "temp": -8,
        "cost": 41459,
        "color": "yellow",
        "target": "C",
        "volume": 4.386049520870563
    },
    {
        "temp": 20,
        "cost": 281284,
        "color": "green",
        "target": "B",
        "volume": 3.1382044294198885
    },
    {
        "temp": -3,
        "cost": 182317,
        "color": "green",
        "target": "D",
        "volume": 7.374397142538927
    },
    {
        "temp": 14,
        "cost": 386510,
        "color": "yellow",
        "target": "A",
        "volume": 1.362634406225693
    },
    {
        "temp": 33,
        "cost": 341362,
        "color": "yellow",
        "target": "A",
        "volume": 4.7831994090818535
    },
    {
        "temp": 28,
        "cost": 217910,
        "color": "yellow",
        "target": "D",
        "volume": 5.763176482363825
    },
    {
        "temp": 31,
        "cost": 111675,
        "color": "red",
        "target": "D",
        "volume": 7.473079298786852
    },
    {
        "temp": 0,
        "cost": 356661,
        "color": "red",
        "target": "A",
        "volume": 6.760193860020401
    },
    {
        "temp": 32,
        "cost": 133776,
        "color": "green",
        "target": "C",
        "volume": 4.640423574603219
    },
    {
        "temp": 9,
        "cost": 230883,
        "color": "red",
        "target": "A",
        "volume": 0.44826683402250744
    },
    {
        "temp": 36,
        "cost": 241788,
        "color": "red",
        "target": "D",
        "volume": 1.2900658714826827
    },
    {
        "temp": 17,
        "cost": 154250,
        "color": "yellow",
        "target": "C",
        "volume": 4.3091534210636295
    },
    {
        "temp": 15,
        "cost": 154658,
        "color": "yellow",
        "target": "B",
        "volume": 5.015478657869602
    },
    {
        "temp": 14,
        "cost": 396988,
        "color": "green",
        "target": "E",
        "volume": 6.222936770625182
    },
    {
        "temp": 38,
        "cost": 11813,
        "color": "yellow",
        "target": "E",
        "volume": 5.787124198261231
    },
    {
        "temp": 39,
        "cost": 221719,
        "color": "red",
        "target": "C",
        "volume": 7.296923669026291
    }
]

export default function ParallelCoordinatesPlot({ postId, attrs }) {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await api.get(`posts/${postId}/visualize?plt=parallelcoordinates`);
                setChartData(response.data);
            } catch (error) {
                notifyError(error);
            }
        }
        fetchData();
    }, [postId])

    return (
        <div className="content-box margin-very-small padding-bottom-big">
            <div className="flex-column padding-small">
                <h2>Parallel Coordinates Plot</h2>
                <h5>Description</h5>
            </div>
            <div className="height-chart">
                <ResponsiveParallelCoordinates
                    data={mockData}
                    variables={[
                        {
                            key: 'temp',
                            type: 'linear',
                            min: 'auto',
                            max: 'auto',
                            ticksPosition: 'before',
                            legend: 'temperature',
                            legendPosition: 'start',
                            legendOffset: 20
                        },
                        {
                            key: 'cost',
                            type: 'linear',
                            min: 0,
                            max: 'auto',
                            ticksPosition: 'before',
                            legend: 'cost',
                            legendPosition: 'start',
                            legendOffset: 20
                        },
                        {
                            key: 'color',
                            type: 'point',
                            padding: 1,
                            values: [
                                'red',
                                'yellow',
                                'green'
                            ],
                            legend: 'color',
                            legendPosition: 'start',
                            legendOffset: -20
                        },
                        {
                            key: 'target',
                            type: 'point',
                            padding: 0,
                            values: [
                                'A',
                                'B',
                                'C',
                                'D',
                                'E'
                            ],
                            legend: 'target',
                            legendPosition: 'start',
                            legendOffset: -20
                        },
                        {
                            key: 'volume',
                            type: 'linear',
                            min: 0,
                            max: 'auto',
                            legend: 'volume',
                            legendPosition: 'start',
                            legendOffset: -20
                        }
                    ]}
                    margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
                />
            </div>
        </div>
    )
}