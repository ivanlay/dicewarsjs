var AreaData = function(){
	this.size=0;		// 0.not present 1～
	this.cpos=0;		// center cell
	this.arm=0;		// army affiliation
	this.dice=0;		// number of dice
	
	// Variables for determining center location
	this.left=0;
	this.right=0;
	this.top=0;
	this.bottom=0;
	this.cx=0;		// middle point between left and right
	this.cy=0;		// middle point between top and bottom
	this.len_min=0;

	// For surrounding lines
	this.line_cel = new Array(100);	// cell
	this.line_dir = new Array(100);	// direction(0～5)
	this.join = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];	// adjacency flags (32)
}

var PlayerData = function(){
	this.area_c=0;	// number of areas
	this.area_tc=0;	// maximum number of adjacent areas
	this.dice_c=0;	// total number of dice
	this.dice_jun=0;	// dice number rank
	this.stock=0;		// stock dice
}

var JoinData = function(){
	this.dir = [0,0,0,0,0,0];
}

var HistoryData = function(){
	this.from=0;	// attacking area, supply area
	this.to=0;		// target area, 0 is supply flag
	this.res=0;		// result 0:attack failed, 1:occupied
}

var Game = function(){
	this.ai = [
		null,
		ai_example,
		ai_defensive,
		ai_defensive,
		ai_default,
		ai_default,
		ai_default,
		ai_default
	];

	var i,j;

	// Method to return adjacent cell number
	this.next_cel = function( opos, dir ){
		var ox = opos%this.XMAX;
		var oy = Math.floor(opos/this.XMAX);
		var f = oy%2;
		var ax=0;
		var ay=0;
		switch(dir){
			case 0: ax=f; ay=-1; break;	// upper right
			case 1: ax=1; break;	// right
			case 2: ax=f; ay=1;break;	// bottom right
			case 3: ax=f-1; ay=1;break;	// bottom left
			case 4: ax=-1; break;	// left
			case 5: ax=f-1; ay=-1; break;	// upper left
		}
		var x = ox+ax;
		var y = oy+ay;
		if( x<0 || y<0 || x>=this.XMAX || y>=this.YMAX ) return -1;
		return y*this.XMAX+x;
	}

	// Cell data
	this.XMAX=28;
	this.YMAX=32;
	this.cel_max = this.XMAX * this.YMAX;
	this.cel = new Array(this.cel_max);
	// Array containing adjacent cells
	this.join = new Array(this.cel_max);
	for( i=0; i<this.cel_max; i++ ){
		this.join[i] = new JoinData();
		for( j=0; j<6; j++ ) this.join[i].dir[j] = this.next_cel(i,j);
	}
	// Area data
	this.AREA_MAX = 32;	// maximum number of areas
	this.adat = new Array();
	for( i=0; i<32; i++ ) this.adat[i] = new AreaData();
	// Used for map creation
	this.num = new Array(this.cel_max);		// area serial number
	for( i=0; i<this.cel_max; i++ ) this.num[i] = i;
	this.rcel = new Array(this.cel_max);		// adjacent cell
	
	this.next_f = new Array(this.cel_max);	// peripheral cells used for penetration
	this.alist = new Array(this.AREA_MAX);	// area list
	this.chk = new Array(this.AREA_MAX);		// for area drawing lines
	this.tc = new Array(this.AREA_MAX);		// used for adjacent area count
	// Game data
	this.pmax=7;		// number of players
	this.user=0;		// user player
	this.put_dice=3;	// average number of placement dice
	this.jun = [0,1,2,3,4,5,6,7];			// order
	this.ban = 0;			// turn - current player is player = jun[ban]
	this.area_from=0;	// attack source
	this.area_to=0;		// attack destination
	this.defeat=0;		// 0:attack failed, 1:attack success
	// Player data
	this.player = new Array(8);
	this.STOCK_MAX=64;	// maximum number of stocks
	// COM thinking
	this.list_from = new Array(this.AREA_MAX*this.AREA_MAX);
	this.list_to = new Array(this.AREA_MAX*this.AREA_MAX);
	// History
	this.his = new Array();
	this.his_c = 0;
	// Initial placement
	this.his_arm = new Array(this.AREA_MAX);
	this.his_dice = new Array(this.AREA_MAX);
	
	// Start game (map must be created, pmax, user etc. must be set)
	this.start_game = function(){
		var i;
		// Shuffle order
		for( i=0; i<8; i++ ) this.jun[i] = i;
		for( i=0; i<this.pmax; i++ ){
			var r = Math.floor(Math.random()*this.pmax);
			var tmp=this.jun[i]; this.jun[i]=this.jun[r]; this.jun[r]=tmp;
		}
		this.ban = 0;
		// Create player data
		for( i=0; i<8; i++ ) this.player[i] = new PlayerData();
		for( i=0; i<8; i++ ) this.set_area_tc(i);
		// History
		this.his_c = 0;
		for( i=0; i<this.AREA_MAX; i++ ){
			this.his_arm[i] = this.adat[i].arm;
			this.his_dice[i] = this.adat[i].dice;
		}
	}
	
	// Maximum number of adjacent areas
	this.set_area_tc = function( pn ){
		this.player[pn].area_tc = 0;
		var i,j;
		for( i=0; i<this.AREA_MAX; i++ ) this.chk[i] = i;
		while( 1 ){
			var f = 0;
			for( i=1; i<this.AREA_MAX; i++ ){
				if( this.adat[i].size == 0 ) continue;
				if( this.adat[i].arm != pn ) continue;
				for( j=1; j<this.AREA_MAX; j++ ){
					if( this.adat[j].size == 0 ) continue;
					if( this.adat[j].arm != pn ) continue;
					if( this.adat[i].join[j]==0 ) continue;
					if( this.chk[j] == this.chk[i] ) continue;
					if( this.chk[i] > this.chk[j] ) this.chk[i]=this.chk[j]; else this.chk[j]=this.chk[i];
					f = 1;
					break;
				}
				if( f ) break;
			}
			if( f==0 ) break;
		}
		for( i=0; i<this.AREA_MAX; i++ ) this.tc[i]=0;
		for( i=1; i<this.AREA_MAX; i++ ){
			if( this.adat[i].size == 0 ) continue;
			if( this.adat[i].arm != pn ) continue;
			this.tc[this.chk[i]]++;
		}
		var max = 0;
		for( i=0; i<this.AREA_MAX; i++ ){
			if( this.tc[i] > max ){
				max = this.tc[i];
			}
		}
		this.player[pn].area_tc = max;
	}
	
	/////////////////////////////////////////////////////////////////////
	// Return current player
	/////////////////////////////////////////////////////////////////////

	this.get_pn = function(){
		return this.jun[this.ban];
	}

	/////////////////////////////////////////////////////////////////////
	// Create map
	/////////////////////////////////////////////////////////////////////

	this.make_map = function(){
		var i,j,k,c,an;
		
		// Shuffle serial numbers
		for( i=0; i<this.cel_max; i++ ){
			var r = Math.floor(Math.random()*this.cel_max);
			var tmp=this.num[i]; this.num[i]=this.num[r]; this.num[r]=tmp;
		}
		// Initialize cells
		for( i=0; i<this.cel_max; i++ ){
			this.cel[i] = 0;
			this.rcel[i] = 0;	// adjacent cell
		}
		var an = 1;	// area number
		this.rcel[Math.floor(Math.random()*this.cel_max)] = 1;	// first cell
		
		while( 1 ){
			// Determine penetration start cell
			var pos;
			var min = 9999;
			for( i=0; i<this.cel_max; i++ ){
				if( this.cel[i] > 0 ) continue;
				if( this.num[i] > min ) continue;
				if( this.rcel[i] == 0 ) continue;
				min = this.num[i];
				pos = i;
			}
			if( min == 9999 ) break;

			// Start penetration
			var ret = this.percolate( pos, 8, an );
			if( ret == 0 ) break;
			an++;
			if( an >= this.AREA_MAX ) break;
		}
		// Remove single-cell areas in sea
		for( i=0; i<this.cel_max; i++ ){
			if( this.cel[i] > 0 ) continue;
			var pos;
			var f = 0;
			var a = 0;
			for( k=0; k<6; k++ ){
				var pos = this.join[i].dir[k];
				if( pos<0 ) continue;
				if( this.cel[pos] == 0 ) f=1; else a=this.cel[pos];
			}
			if( f==0 ) this.cel[i] = a;
		}
		// Initialize area data
		for( i=0; i<this.AREA_MAX; i++ ) this.adat[i] = new AreaData();

		// Area size
		for( i=0; i<this.cel_max; i++ ){
			an = this.cel[i];
			if( an>0 ) this.adat[an].size++;
		}
		// Remove areas with size <= 10
		for( i=1; i<this.AREA_MAX; i++ ){
			if( this.adat[i].size <= 5 ) this.adat[i].size = 0;
		}
		for( i=0; i<this.cel_max; i++ ){
			an = this.cel[i];
			if( this.adat[an].size == 0 ) this.cel[i] = 0;
		}

		// Determine area center
		for( i=1; i<this.AREA_MAX; i++ ){
			this.adat[i].left = this.XMAX;
			this.adat[i].right = -1;
			this.adat[i].top = this.YMAX;
			this.adat[i].bottom = -1;
			this.adat[i].len_min = 9999;
		}
		c = 0;
		for( i=0; i<this.YMAX; i++ ){
			for( j=0; j<this.XMAX; j++ ){
				an = this.cel[c];
				if( an>0 ){
					if( j<this.adat[an].left ) this.adat[an].left = j;
					if( j>this.adat[an].right ) this.adat[an].right = j;
					if( i<this.adat[an].top ) this.adat[an].top = i;
					if( i>this.adat[an].bottom ) this.adat[an].bottom = i;
				}
				c++;
			}
		}
		for( i=1; i<this.AREA_MAX; i++ ){
			this.adat[i].cx = Math.floor(( this.adat[i].left + this.adat[i].right ) / 2);
			this.adat[i].cy = Math.floor(( this.adat[i].top + this.adat[i].bottom ) / 2);
		}
		c=0;
		var x,y,len;
		for( i=0; i<this.YMAX; i++ ){
			for( j=0; j<this.XMAX; j++ ){
				an = this.cel[c];
				if( an>0 ){
					// Distance from center (avoiding boundary lines)
					x = this.adat[an].cx-j; if( x<0 ) x = -x;
					y = this.adat[an].cy-i; if( y<0 ) y = -y;
					len = x+y;
					var f=0;
					for( k=0; k<6; k++ ){
						var pos = this.join[c].dir[k];
						if( pos>0 ){
							var an2 = this.cel[pos];
							if( an2 != an ){
								f=1;
								// Also create adjacency data
								this.adat[an].join[an2] = 1;
							}
						}
					}
					if( f ) len += 4;
					// Use closest point as center
					if( len < this.adat[an].len_min ){
						this.adat[an].len_min = len;
						this.adat[an].cpos = i*this.XMAX+j;
					}
				}
				c++;
			}
		}

		// Determine area army affiliation
		for( i=0; i<this.AREA_MAX; i++ ) this.adat[i].arm = -1;
		var arm=0;	// army affiliation
		var alist = new Array(this.AREA_MAX);	// area list
		while( 1 ){
			var c = 0;
			for( i=1; i<this.AREA_MAX; i++ ){
				if( this.adat[i].size == 0 ) continue;
				if( this.adat[i].arm >= 0 ) continue;
				alist[c] = i;
				c++;
			}
			if( c==0 ) break;
			var an = alist[Math.floor(Math.random()%c)];
			this.adat[an].arm = arm;
			arm++; if( arm>=this.pmax ) arm=0;
		}
		// Create area drawing line data
		for( i=0; i<this.AREA_MAX; i++ ) this.chk[i] = 0;
		for( i=0; i<this.cel_max; i++ ){
			var area = this.cel[i];
			if( area==0 ) continue;
			if( this.chk[area]>0 ) continue;
			for( var k=0; k<6; k++ ){
				if( this.chk[area]>0 ) break;
				var n = this.join[i].dir[k];
				if( n>=0 ){
					if(this.cel[n]!=area){
						this.set_area_line(i,k);
						this.chk[area]=1;
					}
				}
			}
		}
		// Place dice
		var anum = 0;
		for( i=1; i<this.AREA_MAX; i++ ){
			if( this.adat[i].size > 0 ){
				anum++;
				this.adat[i].dice = 1;
			}
		}
		anum *= (this.put_dice-1);
		var p=0;	// player
		for( i=0; i<anum; i++ ){
			var list = new Array(this.AREA_MAX);
			var c = 0;
			for( j=1; j<this.AREA_MAX; j++ ){
				if( this.adat[j].size == 0 ) continue;
				if( this.adat[j].arm != p ) continue;
				if( this.adat[j].dice >= 8 ) continue;
				list[c] = j;
				c++;
			}
			if( c==0 ) break;
			var an = list[Math.floor(Math.random()*c)];
			this.adat[an].dice++;
			p++; if( p>=this.pmax ) p=0;
		}
		for( i=0; i<this.AREA_MAX; i++ ){
//			this.adat[i].dice = 8;//1 + Math.floor(Math.random()*8);
		}
		
	}
	/////////////////////////////////////////////////////////////////////
	// Create area by penetration
	this.percolate = function( pt, cmax, an ){
		if( cmax < 3 ) cmax = 3;

		var i,j,k;
		var opos = pt;	// start cell

		// Adjacency flags
		for(i=0; i<this.cel_max; i++ ) this.next_f[i]=0; 

		var c = 0;			// cell count
		while( 1 ){
			this.cel[opos] = an;
			c++;
			// Surrounding cells
			for( i=0; i<6; i++ ){
				var pos = this.join[opos].dir[i];
				if( pos<0 ) continue;
				this.next_f[pos] = 1;
			}
			// Use cell with minimum serial number as next cell
			var min = 9999;
			for( i=0; i<this.cel_max; i++ ){
				if( this.next_f[i] == 0 ) continue;	// not adjacent
				if( this.cel[i] > 0 ) continue;	// already part of area
				if( this.num[i] > min ) continue;	// not minimum serial number
				min = this.num[i];
				opos = i;
			}
			if( min == 9999 ) break;
			if( c>=cmax ) break;	// exceeded given area size
		}
		// Add adjacent cells
		for( i=0; i<this.cel_max; i++ ){
			if( this.next_f[i] == 0 ) continue;
			if( this.cel[i] > 0 ) continue;		// already part of area
			this.cel[i] = an;
			c++;
			// Add adjacent cells as candidates for next area
			for( k=0; k<6; k++ ){
				var pos = this.join[i].dir[k];
				if( pos<0 ) continue;
				this.rcel[pos] = 1;
			}
		}
		return c;
	}
	/////////////////////////////////////////////////////////////////////
	// Create area drawing line data
	this.set_area_line = function( old_cel, old_dir ){
		var c = old_cel;
		var d = old_dir;
		var area = this.cel[c];	// area number
		var cnt = 0;
		this.adat[area].line_cel[cnt] = c;
		this.adat[area].line_dir[cnt] = d;
		cnt++;
		for( var i=0; i<100; i++ ){
			d++; if( d>=6 ) d=0;	// increment direction
			var n = this.join[c].dir[d];
			if( n>=0 ){
				if( this.cel[n] == area ){
					// If adjacent cell is same area, move cell and subtract 2 from direction
					c = n;
					d-=2; if( d<0 ) d+=6;
				}
			}
			this.adat[area].line_cel[cnt] = c;
			this.adat[area].line_dir[cnt] = d;
			cnt++;
			if( c==old_cel && d==old_dir ) break;
		}
	}

	/////////////////////////////////////////////////////////////////////
	// COM thinking (AI's move)
	this.com_thinking = function() {
		var ai_function = this.ai[ this.jun[this.ban] ]

		return ai_function(this);
	}

	/////////////////////////////////////////////////////////////////////
	// Add to history
	this.set_his = function( from, to, res ){
		this.his[this.his_c] = new HistoryData();
		this.his[this.his_c].from = from;
		this.his[this.his_c].to = to;
		this.his[this.his_c].res = res;
		this.his_c++;
	}
}
