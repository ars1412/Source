"use strict";
var sjcl={
    cipher:{},
    hash:{},
    keyexchange:{},
    mode:{},
    misc:{},
    codec:{},
    exception:{
        corrupt:function(a){
            this.toString=function(){
                return"CORRUPT: "+this.message
                };
                
            this.message=a
            },
        invalid:function(a){
            this.toString=function(){
                return"INVALID: "+this.message
                };
                
            this.message=a
            },
        bug:function(a){
            this.toString=function(){
                return"BUG: "+this.message
                };
                
            this.message=a
            },
        notReady:function(a){
            this.toString=function(){
                return"NOT READY: "+this.message
                };
                
            this.message=a
            }
        }
};

if(typeof module!="undefined"&&module.exports){
    module.exports=sjcl
        }
        sjcl.cipher.aes=function(h){
    if(!this._tables[0][0][0]){
        this._precompute()
        }
        var d,c,e,g,l,f=this._tables[0][4],k=this._tables[1],a=h.length,b=1;
    if(a!==4&&a!==6&&a!==8){
        //throw new sjcl.exception.invalid("invalid aes key size")
        }
        this._key=[g=h.slice(0),l=[]];
    for(d=a;d<4*a+28;d++){
        e=g[d-1];
        if(d%a===0||(a===8&&d%a===4)){
            e=f[e>>>24]<<24^f[e>>16&255]<<16^f[e>>8&255]<<8^f[e&255];
            if(d%a===0){
                e=e<<8^e>>>24^b<<24;
                b=b<<1^(b>>7)*283
                }
            }
        g[d]=g[d-a]^e
    }
    for(c=0;d;c++,d--){
    e=g[c&3?d:d-4];
    if(d<=4||c<4){
        l[c]=e
        }else{
        l[c]=k[0][f[e>>>24]]^k[1][f[e>>16&255]]^k[2][f[e>>8&255]]^k[3][f[e&255]]
        }
    }
};

sjcl.cipher.aes.prototype={
    encrypt:function(a){
        return this._crypt(a,0)
        },
    decrypt:function(a){
        return this._crypt(a,1)
        },
    _tables:[[[],[],[],[],[]],[[],[],[],[],[]]],
    _precompute:function(){
        var j=this._tables[0],q=this._tables[1],h=j[4],n=q[4],g,l,f,k=[],c=[],b,p,m,o,e,a;
        for(g=0;g<0x100;g++){
            c[(k[g]=g<<1^(g>>7)*283)^g]=g
            }
            for(l=f=0;!h[l];l^=b||1,f=c[f]||1){
            o=f^f<<1^f<<2^f<<3^f<<4;
            o=o>>8^o&255^99;
            h[l]=o;
            n[o]=l;
            m=k[p=k[b=k[l]]];
            a=m*0x1010101^p*0x10001^b*0x101^l*0x1010100;
            e=k[o]*0x101^o*0x1010100;
            for(g=0;g<4;g++){
                j[g][l]=e=e<<24^e>>>8;
                q[g][o]=a=a<<24^a>>>8
                }
            }
            for(g=0;g<5;g++){
        j[g]=j[g].slice(0);
        q[g]=q[g].slice(0)
        }
    },
_crypt:function(k,n){
    if(k.length!==4){
        //throw new sjcl.exception.invalid("invalid aes block size")
        }
        var y=this._key[n],v=k[0]^y[0],u=k[n?3:1]^y[1],t=k[2]^y[2],s=k[n?1:3]^y[3],w,e,m,x=y.length/4-2,p,o=4,q=[0,0,0,0],r=this._tables[n],j=r[0],h=r[1],g=r[2],f=r[3],l=r[4];
    for(p=0;p<x;p++){
        w=j[v>>>24]^h[u>>16&255]^g[t>>8&255]^f[s&255]^y[o];
        e=j[u>>>24]^h[t>>16&255]^g[s>>8&255]^f[v&255]^y[o+1];
        m=j[t>>>24]^h[s>>16&255]^g[v>>8&255]^f[u&255]^y[o+2];
        s=j[s>>>24]^h[v>>16&255]^g[u>>8&255]^f[t&255]^y[o+3];
        o+=4;
        v=w;
        u=e;
        t=m
        }
        for(p=0;p<4;p++){
        q[n?3&-p:p]=l[v>>>24]<<24^l[u>>16&255]<<16^l[t>>8&255]<<8^l[s&255]^y[o++];
        w=v;
        v=u;
        u=t;
        t=s;
        s=w
        }
        return q
    }
};

sjcl.bitArray={
    bitSlice:function(b,c,d){
        b=sjcl.bitArray._shiftRight(b.slice(c/32),32-(c&31)).slice(1);
        return(d===undefined)?b:sjcl.bitArray.clamp(b,d-c)
        },
    extract:function(c,d,f){
        var b,e=Math.floor((-d-f)&31);
        if((d+f-1^d)&-32){
            b=(c[d/32|0]<<(32-e))^(c[d/32+1|0]>>>e)
            }else{
            b=c[d/32|0]>>>e
            }
            return b&((1<<f)-1)
        },
    concat:function(c,a){
        if(c.length===0||a.length===0){
            return c.concat(a)
            }
            var d,e,f=c[c.length-1],b=sjcl.bitArray.getPartial(f);
        if(b===32){
            return c.concat(a)
            }else{
            return sjcl.bitArray._shiftRight(a,b,f|0,c.slice(0,c.length-1))
            }
        },
bitLength:function(d){
    try{
        var c=d.length,b;
        if(c===0){
            return 0
            }
            b=d[c-1];
        return(c-1)*32+sjcl.bitArray.getPartial(b);
    }catch(e){console.log('line 158 at file sjcl.js');}
    },
clamp:function(d,b){
    if(d.length*32<b){
        return d
        }
        d=d.slice(0,Math.ceil(b/32));
    var c=d.length;
    b=b&31;
    if(c>0&&b){
        d[c-1]=sjcl.bitArray.partial(b,d[c-1]&2147483648>>(b-1),1)
        }
        return d
    },
partial:function(b,a,c){
    if(b===32){
        return a
        }
        return(c?a|0:a<<(32-b))+b*0x10000000000
    },
getPartial:function(a){
    return Math.round(a/0x10000000000)||32
    },
equal:function(e,d){
    if(sjcl.bitArray.bitLength(e)!==sjcl.bitArray.bitLength(d)){
        return false
        }
        var c=0,f;
    for(f=0;f<e.length;f++){
        c|=e[f]^d[f]
        }
        return(c===0)
    },
_shiftRight:function(d,c,h,f){
    var g,b=0,e;
    if(f===undefined){
        f=[]
        }
        for(;c>=32;c-=32){
        f.push(h);
        h=0
        }
        if(c===0){
        return f.concat(d)
        }
        for(g=0;g<d.length;g++){
        f.push(h|d[g]>>>c);
        h=d[g]<<(32-c)
        }
        b=d.length?d[d.length-1]:0;
    e=sjcl.bitArray.getPartial(b);
    f.push(sjcl.bitArray.partial(c+e&31,(c+e>32)?h:f.pop(),1));
    return f
    },
_xor4:function(a,b){
    return[a[0]^b[0],a[1]^b[1],a[2]^b[2],a[3]^b[3]]
    }
};

sjcl.codec.utf8String={
    fromBits:function(a){
        try{
        var b="",e=sjcl.bitArray.bitLength(a),d,c;
        for(d=0;d<e/8;d++){
            if((d&3)===0){
                c=a[d/4]
                }
                b+=String.fromCharCode(c>>>24);
            c<<=8
            }
            return decodeURIComponent(escape(b))
        }catch(e){}
    },
    toBits:function(d){
        try{
        d=unescape(encodeURIComponent(d));
        var a=[],c,b=0;
        for(c=0;c<d.length;c++){
            b=b<<8|d.charCodeAt(c);
            if((c&3)===3){
                a.push(b);
                b=0
                }
            }
        if(c&3){
        a.push(sjcl.bitArray.partial(8*(c&3),b))
        }
        return a
        }catch(e){}
    }
};

sjcl.codec.hex={
    fromBits:function(b){
        var c="",d,a;
        for(d=0;d<b.length;d++){
            c+=((b[d]|0)+0xf00000000000).toString(16).substr(4)
            }
            return c.substr(0,sjcl.bitArray.bitLength(b)/4)
        },
    toBits:function(d){
        var c,b=[],a;
        d=d.replace(/\s|0x/g,"");
        a=d.length;
        d=d+"00000000";
        for(c=0;c<d.length;c+=8){
            b.push(parseInt(d.substr(c,8),16)^0)
            }
            return sjcl.bitArray.clamp(b,a*4)
        }
    };

sjcl.codec.base64={
    _chars:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    fromBits:function(g,k,b){
        var d="",e,j=0,h=sjcl.codec.base64._chars,f=0,a=sjcl.bitArray.bitLength(g);
        if(b){
            h=h.substr(0,62)+"-_"
            }
            for(e=0;d.length*6<a;){
            d+=h.charAt((f^g[e]>>>j)>>>26);
            if(j<6){
                f=g[e]<<(6-j);
                j+=26;
                e++
            }else{
                f<<=6;
                j-=6
                }
            }while((d.length&3)&&!k){
        d+="="
        }
        return d
    },
toBits:function(h,f){
    h=h.replace(/\s|=/g,"");
    var d=[],e,g=0,j=sjcl.codec.base64._chars,b=0,a;
    if(f){
        j=j.substr(0,62)+"-_"
        }
        for(e=0;e<h.length;e++){
        a=j.indexOf(h.charAt(e));
        if(a<0){
            //throw new sjcl.exception.invalid("this isn't base64!")
            }
            if(g>26){
            g-=26;
            d.push(b^a>>>g);
            b=a<<(32-g)
            }else{
            g+=6;
            b^=a<<(32-g)
            }
        }
    if(g&56){
    d.push(sjcl.bitArray.partial(g&56,b,1))
    }
    return d
}
};

sjcl.codec.base64url={
    fromBits:function(a){
        return sjcl.codec.base64.fromBits(a,1,1)
        },
    toBits:function(a){
        return sjcl.codec.base64.toBits(a,1)
        }
    };

sjcl.hash.sha256=function(a){
    if(!this._key[0]){
        this._precompute()
        }
        if(a){
        this._h=a._h.slice(0);
        this._buffer=a._buffer.slice(0);
        this._length=a._length
        }else{
        this.reset()
        }
    };

sjcl.hash.sha256.hash=function(a){
    return(new sjcl.hash.sha256()).update(a).finalize()
    };
    
sjcl.hash.sha256.prototype={
    blockSize:512,
    reset:function(){
        this._h=this._init.slice(0);
        this._buffer=[];
        this._length=0;
        return this
        },
    update:function(f){
        if(typeof f==="string"){
            f=sjcl.codec.utf8String.toBits(f)
            }
            var e,a=this._buffer=sjcl.bitArray.concat(this._buffer,f),d=this._length,c=this._length=d+sjcl.bitArray.bitLength(f);
        for(e=512+d&-512;e<=c;e+=512){
            this._block(a.splice(0,16))
            }
            return this
        },
    finalize:function(){
        var c,a=this._buffer,d=this._h;
        a=sjcl.bitArray.concat(a,[sjcl.bitArray.partial(1,1)]);
        for(c=a.length+2;c&15;c++){
            a.push(0)
            }
            a.push(Math.floor(this._length/0x100000000));
        a.push(this._length|0);
        while(a.length){
            this._block(a.splice(0,16))
            }
            this.reset();
        return d
        },
    _init:[],
    _key:[],
    _precompute:function(){
        var d=0,c=2,b;
        function a(e){
            return(e-Math.floor(e))*0x100000000|0
            }
            outer:for(;d<64;c++){
            for(b=2;b*b<=c;b++){
                if(c%b===0){
                    continue outer
                }
            }
            if(d<8){
            this._init[d]=a(Math.pow(c,1/2))
            }
            this._key[d]=a(Math.pow(c,1/3));
            d++
            }
        },
_block:function(q){
    var e,f,t,s,u=q.slice(0),j=this._h,c=this._key,r=j[0],p=j[1],o=j[2],n=j[3],m=j[4],l=j[5],g=j[6],d=j[7];
    for(e=0;e<64;e++){
        if(e<16){
            f=u[e]
            }else{
            t=u[(e+1)&15];
            s=u[(e+14)&15];
            f=u[e&15]=((t>>>7^t>>>18^t>>>3^t<<25^t<<14)+(s>>>17^s>>>19^s>>>10^s<<15^s<<13)+u[e&15]+u[(e+9)&15])|0
            }
            f=(f+d+(m>>>6^m>>>11^m>>>25^m<<26^m<<21^m<<7)+(g^m&(l^g))+c[e]);
        d=g;
        g=l;
        l=m;
        m=n+f|0;
        n=o;
        o=p;
        p=r;
        r=(f+((p&o)^(n&(p^o)))+(p>>>2^p>>>13^p>>>22^p<<30^p<<19^p<<10))|0
        }
        j[0]=j[0]+r|0;
    j[1]=j[1]+p|0;
    j[2]=j[2]+o|0;
    j[3]=j[3]+n|0;
    j[4]=j[4]+m|0;
    j[5]=j[5]+l|0;
    j[6]=j[6]+g|0;
    j[7]=j[7]+d|0
    }
};

sjcl.mode.ccm={
    
    name:"ccm",
    encrypt:function(c,b,e,m,d){
        try {
            if(typeof b !== 'undefined') {
                var j,g,f=b.slice(0),l,k=sjcl.bitArray,a=k.bitLength(e)/8,h=k.bitLength(f)/8;
                d=d||64;
                m=m||[];
                if(a<7){
                    //throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes")
                    }
                    for(j=2;j<4&&h>>>8*j;j++){}
                    if(j<15-a){
                    j=15-a
                    }
                    e=k.clamp(e,8*(15-j));
                l=sjcl.mode.ccm._computeTag(c,b,e,m,d,j);
                f=sjcl.mode.ccm._ctrMode(c,f,e,l,d,j);
                return k.concat(f.data,f.tag)
            }
        } catch(e){
            console.log('Cannot call method slice of undefined');
        }
        },
    decrypt:function(b,c,e,n,d){
        try{
        d=d||64;
        n=n||[];
        var j,g,l=sjcl.bitArray,a=l.bitLength(e)/8,h=l.bitLength(c),f=l.clamp(c,h-d),m=l.bitSlice(c,h-d),k;
        h=(h-d)/8;
        if(a<7){
            //throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes")
            }
            for(j=2;j<4&&h>>>8*j;j++){}
            if(j<15-a){
            j=15-a
            }
            e=l.clamp(e,8*(15-j));
        f=sjcl.mode.ccm._ctrMode(b,f,e,m,d,j);
        k=sjcl.mode.ccm._computeTag(b,f.data,e,n,d,j);
        if(!l.equal(f.tag,k)){
            //throw new sjcl.exception.corrupt("ccm: tag doesn't match")
            }
            return f.data
        } catch(e){
            console.log('Cannot call method slice of undefined');
        }
        },
    _computeTag:function(d,c,f,p,e,m){
        var b,l,n=0,g=24,j,h,a=[],o=sjcl.bitArray,k=o._xor4;
        e/=8;
        if(e%2||e<4||e>16){
            //throw new sjcl.exception.invalid("ccm: invalid tag length")
            }
            if(p.length>0xffffffff||c.length>0xffffffff){
            //throw new sjcl.exception.bug("ccm: can't deal with 4GiB or more data")
            }
            l=[o.partial(8,(p.length?1<<6:0)|(e-2)<<2|m-1)];
        l=o.concat(l,f);
        l[3]|=o.bitLength(c)/8;
        l=d.encrypt(l);
        if(p.length){
            j=o.bitLength(p)/8;
            if(j<=65279){
                a=[o.partial(16,j)]
                }else{
                if(j<=0xffffffff){
                    a=o.concat([o.partial(16,65534)],[j])
                    }
                }
            a=o.concat(a,p);
        for(h=0;h<a.length;h+=4){
            l=d.encrypt(k(l,a.slice(h,h+4).concat([0,0,0])))
            }
        }
        for(h=0;h<c.length;h+=4){
    l=d.encrypt(k(l,c.slice(h,h+4).concat([0,0,0])))
    }
    return o.clamp(l,e*8)
    },
_ctrMode:function(d,j,g,q,f,n){
    var h,k,p=sjcl.bitArray,m=p._xor4,c,o,e=j.length,a=p.bitLength(j);
    c=p.concat([p.partial(8,n-1)],g).concat([0,0,0]).slice(0,4);
    q=p.bitSlice(m(q,d.encrypt(c)),0,f);
    if(!e){
        return{
            tag:q,
            data:[]
        }
    }
    for(k=0;k<e;k+=4){
    c[3]++;
    h=d.encrypt(c);
    j[k]^=h[0];
    j[k+1]^=h[1];
    j[k+2]^=h[2];
    j[k+3]^=h[3]
    }
    return{
    tag:q,
    data:p.clamp(j,a)
    }
}
};

sjcl.mode.ocb2={
    name:"ocb2",
    encrypt:function(o,a,g,q,e,l){
        if(sjcl.bitArray.bitLength(g)!==128){
            //throw new sjcl.exception.invalid("ocb iv must be 128 bits")
            }
            var h,m=sjcl.mode.ocb2._times2,n=sjcl.bitArray,j=n._xor4,k=[0,0,0,0],p=m(o.encrypt(g)),f,c,b=[],d;
        q=q||[];
        e=e||64;
        for(h=0;h+4<a.length;h+=4){
            f=a.slice(h,h+4);
            k=j(k,f);
            b=b.concat(j(p,o.encrypt(j(p,f))));
            p=m(p)
            }
            f=a.slice(h);
        c=n.bitLength(f);
        d=o.encrypt(j(p,[0,0,0,c]));
        f=n.clamp(j(f.concat([0,0,0]),d),c);
        k=j(k,j(f.concat([0,0,0]),d));
        k=o.encrypt(j(k,j(p,m(p))));
        if(q.length){
            k=j(k,l?q:sjcl.mode.ocb2.pmac(o,q))
            }
            return b.concat(n.concat(f,n.clamp(k,e)))
        },
    decrypt:function(p,d,g,r,e,m){
        if(sjcl.bitArray.bitLength(g)!==128){
            //throw new sjcl.exception.invalid("ocb iv must be 128 bits")
            }
            e=e||64;
        var h,n=sjcl.mode.ocb2._times2,o=sjcl.bitArray,j=o._xor4,l=[0,0,0,0],q=n(p.encrypt(g)),f,b,k=sjcl.bitArray.bitLength(d)-e,a=[],c;
        r=r||[];
        for(h=0;h+4<k/32;h+=4){
            f=j(q,p.decrypt(j(q,d.slice(h,h+4))));
            l=j(l,f);
            a=a.concat(f);
            q=n(q)
            }
            b=k-h*32;
        c=p.encrypt(j(q,[0,0,0,b]));
        f=j(c,o.clamp(d.slice(h),b).concat([0,0,0]));
        l=j(l,f);
        l=p.encrypt(j(l,j(q,n(q))));
        if(r.length){
            l=j(l,m?r:sjcl.mode.ocb2.pmac(p,r))
            }
            if(!o.equal(o.clamp(l,e),o.bitSlice(d,k))){
            //throw new sjcl.exception.corrupt("ocb: tag doesn't match")
            }
            return a.concat(o.clamp(f,b))
        },
    pmac:function(f,j){
        var b,e=sjcl.mode.ocb2._times2,g=sjcl.bitArray,c=g._xor4,d=[0,0,0,0],h=f.encrypt([0,0,0,0]),a;
        h=c(h,e(e(h)));
        for(b=0;b+4<j.length;b+=4){
            h=e(h);
            d=c(d,f.encrypt(c(h,j.slice(b,b+4))))
            }
            a=j.slice(b);
        if(g.bitLength(a)<128){
            h=c(h,e(h));
            a=g.concat(a,[2147483648|0,0,0,0])
            }
            d=c(d,a);
        return f.encrypt(c(e(c(h,e(h))),d))
        },
    _times2:function(a){
        return[a[0]<<1^a[1]>>>31,a[1]<<1^a[2]>>>31,a[2]<<1^a[3]>>>31,a[3]<<1^(a[0]>>>31)*135]
        }
    };

sjcl.misc.hmac=function(d,e){
    this._hash=e=e||sjcl.hash.sha256;
    var c=[[],[]],b,a=e.prototype.blockSize/32;
    this._baseHash=[new e(),new e()];
    if(d.length>a){
        d=e.hash(d)
        }
        for(b=0;b<a;b++){
        c[0][b]=d[b]^909522486;
        c[1][b]=d[b]^1549556828
        }
        this._baseHash[0].update(c[0]);
    this._baseHash[1].update(c[1])
    };
    
sjcl.misc.hmac.prototype.encrypt=sjcl.misc.hmac.prototype.mac=function(c,b){
    var a=new (this._hash)(this._baseHash[0]).update(c,b).finalize();
    return new (this._hash)(this._baseHash[1]).update(a).finalize()
    };
    
sjcl.misc.pbkdf2=function(o,h,l,a,q){
    l=l||1000;
    if(a<0||l<0){
        //throw sjcl.exception.invalid("invalid params to pbkdf2")
        }
        if(typeof o==="string"){
        o=sjcl.codec.utf8String.toBits(o)
        }
        q=q||sjcl.misc.hmac;
    var c=new q(o),p,n,g,f,d,e=[],m=sjcl.bitArray;
    for(d=1;32*e.length<(a||1);d++){
        p=n=c.encrypt(m.concat(h,[d]));
        for(g=1;g<l;g++){
            n=c.encrypt(n);
            for(f=0;f<n.length;f++){
                p[f]^=n[f]
                }
            }
            e=e.concat(p)
        }
        if(a){
    e=m.clamp(e,a)
    }
    return e
};

sjcl.random={
    randomWords:function(a,f){
        var b=[],d,c=this.isReady(f),e;
        if(c===0){
            //throw new sjcl.exception.notReady("generator isn't seeded")
            }else{
            if(c&2){
                this._reseedFromPools(!(c&1))
                }
            }
        for(d=0;d<a;d+=4){
        if((d+1)%0x10000===0){
            this._gate()
            }
            e=this._gen4words();
        b.push(e[0],e[1],e[2],e[3])
        }
        this._gate();
    return b.slice(0,a)
    },
setDefaultParanoia:function(a){
    this._defaultParanoia=a
    },
addEntropy:function(e,k,a){
    a=a||"user";
    var c,f,d=0,g,h=(new Date()).valueOf(),b=this._robins[a],j=this.isReady();
    c=this._collectorIds[a];
    if(c===undefined){
        c=this._collectorIds[a]=this._collectorIdNext++
    }
    if(b===undefined){
        b=this._robins[a]=0
        }
        this._robins[a]=(this._robins[a]+1)%this._pools.length;
    switch(typeof(e)){
        case"number":
            e=[e];
            d=1;
            break;
        case"object":
            if(k===undefined){
            k=0;
            for(f=0;f<e.length;f++){
                g=e[f];
                while(g>0){
                    k++;
                    g=g>>>1
                    }
                }
            }
        this._pools[b].update([c,this._eventId++,d||2,k,h,e.length].concat(e));
    break;
case"string":
    if(k===undefined){
    k=e.length
    }
    this._pools[b].update([c,this._eventId++,3,k,h,e.length]);
    this._pools[b].update(e);
    break;
    default:
    //throw new sjcl.exception.bug("random: addEntropy only supports number, array or string")
    }
    this._poolEntropy[b]+=k;
this._poolStrength+=k;
if(j===0){
    if(this.isReady()!==0){
        this._fireEvent("seeded",Math.max(this._strength,this._poolStrength))
        }
        this._fireEvent("progress",this.getProgress())
    }
},
isReady:function(b){
    var a=this._PARANOIA_LEVELS[(b!==undefined)?b:this._defaultParanoia];
    if(this._strength&&this._strength>=a){
        return(this._poolEntropy[0]>80&&(new Date()).valueOf()>this._nextReseed)?2|1:1
        }else{
        return(this._poolStrength>=a)?2|0:0
        }
    },
getProgress:function(b){
    var a=this._PARANOIA_LEVELS[b?b:this._defaultParanoia];
    if(this._strength>=a){
        return 1
        }else{
        return(this._poolStrength>a)?1:this._poolStrength/a
        }
    },
startCollectors:function(){
    if(this._collectorsStarted){
        return
    }
    if(window.addEventListener){
        window.addEventListener("load",this._loadTimeCollector,false);
        window.addEventListener("mousemove",this._mouseCollector,false)
        }else{
        if(document.attachEvent){
            document.attachEvent("onload",this._loadTimeCollector);
            document.attachEvent("onmousemove",this._mouseCollector)
            }else{
            //throw new sjcl.exception.bug("can't attach event")
            }
        }
    this._collectorsStarted=true
},
stopCollectors:function(){
    if(!this._collectorsStarted){
        return
    }
    if(window.removeEventListener){
        window.removeEventListener("load",this._loadTimeCollector,false);
        window.removeEventListener("mousemove",this._mouseCollector,false)
        }else{
        if(window.detachEvent){
            window.detachEvent("onload",this._loadTimeCollector);
            window.detachEvent("onmousemove",this._mouseCollector)
            }
        }
    this._collectorsStarted=false
},
addEventListener:function(a,b){
    this._callbacks[a][this._callbackI++]=b
    },
removeEventListener:function(e,a){
    var f,d,c=this._callbacks[e],b=[];
    for(d in c){
        if(c.hasOwnProperty(d)&&c[d]===a){
            b.push(d)
            }
        }
    for(f=0;f<b.length;f++){
    d=b[f];
    delete c[d]
}
},
_pools:[new sjcl.hash.sha256()],
_poolEntropy:[0],
_reseedCount:0,
_robins:{},
_eventId:0,
_collectorIds:{},
_collectorIdNext:0,
_strength:0,
_poolStrength:0,
_nextReseed:0,
_key:[0,0,0,0,0,0,0,0],
_counter:[0,0,0,0],
_cipher:undefined,
_defaultParanoia:6,
_collectorsStarted:false,
_callbacks:{
    progress:{},
    seeded:{}
},
_callbackI:0,
_PARANOIA_LEVELS:[0,48,64,96,128,192,0x100,384,512,768,1024],
_gen4words:function(){
    for(var a=0;a<4;a++){
        this._counter[a]=this._counter[a]+1|0;
        if(this._counter[a]){
            break
        }
    }
    return this._cipher.encrypt(this._counter)
},
_gate:function(){
    this._key=this._gen4words().concat(this._gen4words());
    this._cipher=new sjcl.cipher.aes(this._key)
    },
_reseed:function(b){
    this._key=sjcl.hash.sha256.hash(this._key.concat(b));
    this._cipher=new sjcl.cipher.aes(this._key);
    for(var a=0;a<4;a++){
        this._counter[a]=this._counter[a]+1|0;
        if(this._counter[a]){
            break
        }
    }
    },
_reseedFromPools:function(c){
    var a=[],d=0,b;
    this._nextReseed=a[0]=(new Date()).valueOf()+30000;
    for(b=0;b<16;b++){
        a.push(Math.random()*0x100000000|0)
        }
        for(b=0;b<this._pools.length;b++){
        a=a.concat(this._pools[b].finalize());
        d+=this._poolEntropy[b];
        this._poolEntropy[b]=0;
        if(!c&&(this._reseedCount&(1<<b))){
            break
        }
    }
    if(this._reseedCount>=1<<this._pools.length){
    this._pools.push(new sjcl.hash.sha256());
    this._poolEntropy.push(0)
    }
    this._poolStrength-=d;
if(d>this._strength){
    this._strength=d
    }
    this._reseedCount++;
this._reseed(a)
},
_mouseCollector:function(b){
    var a=b.x||b.clientX||b.offsetX,c=b.y||b.clientY||b.offsetY;
    sjcl.random.addEntropy([a,c],2,"mouse")
    },
_loadTimeCollector:function(a){
    var b=new Date();
    sjcl.random.addEntropy(b,2,"loadtime")
    },
_fireEvent:function(d,a){
    var c,b=sjcl.random._callbacks[d],e=[];
    for(c in b){
        if(b.hasOwnProperty(c)){
            e.push(b[c])
            }
        }
    for(c=0;c<e.length;c++){
    e[c](a)
    }
}
};
(function(){
    try{
        var a=new Uint32Array(32);
        crypto.getRandomValues(a);
        sjcl.random.addEntropy(a,1024,"crypto.getRandomValues")
        }catch(b){}
})();
sjcl.json={
    defaults:{
        v:1,
        iter:1000,
        ks:128,
        ts:64,
        mode:"ccm",
        adata:"",
        cipher:"aes"
    },
    encrypt:function(h,b,c,f){
        c=c||{};
        
        f=f||{};
        
        var d=sjcl.json,a=d._add({
            iv:sjcl.random.randomWords(4,0)
            },d.defaults),e,g,i;
        d._add(a,c);
        i=a.adata;
        if(typeof a.salt==="string"){
            a.salt=sjcl.codec.base64.toBits(a.salt)
            }
            if(typeof a.iv==="string"){
            a.iv=sjcl.codec.base64.toBits(a.iv)
            }
            if(!sjcl.mode[a.mode]||!sjcl.cipher[a.cipher]||(typeof h==="string"&&a.iter<=100)||(a.ts!==64&&a.ts!==96&&a.ts!==128)||(a.ks!==128&&a.ks!==192&&a.ks!==0x100)||(a.iv.length<2||a.iv.length>4)){
            //throw new sjcl.exception.invalid("json encrypt: invalid parameters")
            }
            if(typeof h==="string"){
            e=sjcl.misc.cachedPbkdf2(h,a);
            h=e.key.slice(0,a.ks/32);
            a.salt=e.salt
            }else{
            if(sjcl.ecc&&h instanceof sjcl.ecc.elGamal.publicKey){
                e=h.kem();
                a.kemtag=e.tag;
                h=e.key.slice(0,a.ks/32)
                }
            }
        if(typeof b==="string"){
        b=sjcl.codec.utf8String.toBits(b)
        }
        if(typeof i==="string"){
        i=sjcl.codec.utf8String.toBits(i)
        }
        g=new sjcl.cipher[a.cipher](h);
    d._add(f,a);
    f.key=h;
    a.ct=sjcl.mode[a.mode].encrypt(g,b,a.iv,i,a.ts);
    return d.encode(a)
    },
decrypt:function(i,b,c,f){
    c=c||{};
    
    f=f||{};
    
    var d=sjcl.json,a=d._add(d._add(d._add({},d.defaults),d.decode(b)),c,true),g,e,h,k=a.adata;
    if(typeof a.salt==="string"){
        a.salt=sjcl.codec.base64.toBits(a.salt)
        }
        if(typeof a.iv==="string"){
        a.iv=sjcl.codec.base64.toBits(a.iv)
        }
        if(!sjcl.mode[a.mode]||!sjcl.cipher[a.cipher]||(typeof i==="string"&&a.iter<=100)||(a.ts!==64&&a.ts!==96&&a.ts!==128)||(a.ks!==128&&a.ks!==192&&a.ks!==0x100)||(!a.iv)||(a.iv.length<2||a.iv.length>4)){
        //throw new sjcl.exception.invalid("json decrypt: invalid parameters")
        }
        if(typeof i==="string"){
        e=sjcl.misc.cachedPbkdf2(i,a);
        i=e.key.slice(0,a.ks/32);
        a.salt=e.salt
        }else{
        if(sjcl.ecc&&i instanceof sjcl.ecc.elGamal.secretKey){
            i=i.unkem(sjcl.codec.base64.toBits(a.kemtag)).slice(0,a.ks/32)
            }
        }
    if(typeof k==="string"){
    k=sjcl.codec.utf8String.toBits(k)
    }
    h=new sjcl.cipher[a.cipher](i);
    g=sjcl.mode[a.mode].decrypt(h,a.ct,a.iv,k,a.ts);
    d._add(f,a);
    f.key=i;
    return sjcl.codec.utf8String.fromBits(g)
    },
encode:function(d){
    var c,b="{",a="";
    for(c in d){
        if(d.hasOwnProperty(c)){
            if(!c.match(/^[a-z0-9]+$/i)){
                //throw new sjcl.exception.invalid("json encode: invalid property name")
                }
                b+=a+'"'+c+'":';
            a=",";
            switch(typeof d[c]){
                case"number":case"boolean":
                    b+=d[c];
                    break;
                case"string":
                    b+='"'+escape(d[c])+'"';
                    break;
                case"object":
                    b+='"'+sjcl.codec.base64.fromBits(d[c],1)+'"';
                    break;
                default:
                    //throw new sjcl.exception.bug("json encode: unsupported type")
                    }
                }
    }
    return b+"}"
},
decode:function(f){
    try {
    f=f.replace(/\s/g,"");
    if(!f.match(/^\{.*\}$/)){
        //throw new sjcl.exception.invalid("json decode: this isn't json!")
        }
        var c=f.replace(/^\{|\}$/g,"").split(/,/),d={},e,b;
    for(e=0;e<c.length;e++){
        if(!(b=c[e].match(/^(?:(["']?)([a-z][a-z0-9]*)\1):(?:(\d+)|"([a-z0-9+\/%*_.@=\-]*)")$/i))){
            //throw new sjcl.exception.invalid("json decode: this isn't json!")
            }
            if(b[3]){
            d[b[2]]=parseInt(b[3],10)
            }else{
            d[b[2]]=b[2].match(/^(ct|salt|iv)$/)?sjcl.codec.base64.toBits(b[4]):unescape(b[4])
            }
        }
    return d
    }catch(e){}
},
_add:function(c,d,b){
    if(c===undefined){
        c={}
    }
    if(d===undefined){
    return c
    }
    var a;
for(a in d){
    if(d.hasOwnProperty(a)){
        if(b&&c[a]!==undefined&&c[a]!==d[a]){
            //throw new sjcl.exception.invalid("required parameter overridden")
            }
            c[a]=d[a]
        }
    }
return c
},
_subtract:function(d,c){
    var a={},b;
    for(b in d){
        if(d.hasOwnProperty(b)&&d[b]!==c[b]){
            a[b]=d[b]
            }
        }
    return a
},
_filter:function(d,c){
    var a={},b;
    for(b=0;b<c.length;b++){
        if(d[c[b]]!==undefined){
            a[c[b]]=d[c[b]]
            }
        }
    return a
}
};

sjcl.encrypt=sjcl.json.encrypt;
sjcl.decrypt=sjcl.json.decrypt;
sjcl.misc._pbkdf2Cache={};
    
sjcl.misc.cachedPbkdf2=function(d,g){
    var b=sjcl.misc._pbkdf2Cache,i,f,h,e,a;
    g=g||{};
    
    a=g.iter||1000;
    f=b[d]=b[d]||{};
    
    i=f[a]=f[a]||{
        firstSalt:(g.salt&&g.salt.length)?g.salt.slice(0):sjcl.random.randomWords(2,0)
        };
        
    e=(g.salt===undefined)?i.firstSalt:g.salt;
    i[e]=i[e]||sjcl.misc.pbkdf2(d,e,g.iter);
    return{
        key:i[e].slice(0),
        salt:e.slice(0)
        }
    };

sjcl.bn=function(a){
    this.initWith(a)
    };
    
sjcl.bn.prototype={
    radix:24,
    maxMul:8,
    _class:sjcl.bn,
    copy:function(){
        return new this._class(this)
        },
    initWith:function(d){
        var c=0,b,e,a;
        switch(typeof d){
            case"object":
                this.limbs=d.limbs.slice(0);
                break;
            case"number":
                this.limbs=[d];
                this.normalize();
                break;
            case"string":
                d=d.replace(/^0x/,"");
                this.limbs=[];
                b=this.radix/4;
                for(c=0;c<d.length;c+=b){
                this.limbs.push(parseInt(d.substring(Math.max(d.length-c-b,0),d.length-c),16))
                }
                break;
            default:
                this.limbs=[0]
                }
                return this
        },
    equals:function(b){
        if(typeof b==="number"){
            b=new this._class(b)
            }
            var c=0,a;
        this.fullReduce();
        b.fullReduce();
        for(a=0;a<this.limbs.length||a<b.limbs.length;a++){
            c|=this.getLimb(a)^b.getLimb(a)
            }
            return(c===0)
        },
    getLimb:function(a){
        return(a>=this.limbs.length)?0:this.limbs[a]
        },
    greaterEquals:function(g){
        if(typeof g==="number"){
            g=new this._class(g)
            }
            var e=0,h=0,f,d,c;
        f=Math.max(this.limbs.length,g.limbs.length)-1;
        for(;f>=0;f--){
            d=this.getLimb(f);
            c=g.getLimb(f);
            h|=(c-d)&~e;
            e|=(d-c)&~h
            }
            return(h|~e)>>>31
        },
    toString:function(){
        this.fullReduce();
        var b="",c,d,a=this.limbs;
        for(c=0;c<this.limbs.length;c++){
            d=a[c].toString(16);
            while(c<this.limbs.length-1&&d.length<6){
                d="0"+d
                }
                b=d+b
            }
            return"0x"+b
        },
    addM:function(c){
        if(typeof(c)!=="object"){
            c=new this._class(c)
            }
            var b,a=this.limbs,d=c.limbs;
        for(b=a.length;b<d.length;b++){
            a[b]=0
            }
            for(b=0;b<d.length;b++){
            a[b]+=d[b]
            }
            return this
        },
    doubleM:function(){
        var d,f=0,c,e=this.radix,a=this.radixMask,b=this.limbs;
        for(d=0;d<b.length;d++){
            c=b[d];
            c=c+c+f;
            b[d]=c&a;
            f=c>>e
            }
            if(f){
            b.push(f)
            }
            return this
        },
    halveM:function(){
        var c,e=0,b,d=this.radix,a=this.limbs;
        for(c=a.length-1;c>=0;c--){
            b=a[c];
            a[c]=(b+e)>>1;
            e=(b&1)<<d
            }
            if(!a[a.length-1]){
            a.pop()
            }
            return this
        },
    subM:function(c){
        if(typeof(c)!=="object"){
            c=new this._class(c)
            }
            var b,a=this.limbs,d=c.limbs;
        for(b=a.length;b<d.length;b++){
            a[b]=0
            }
            for(b=0;b<d.length;b++){
            a[b]-=d[b]
            }
            return this
        },
    mod:function(c){
        c=new sjcl.bn(c).normalize();
        var a=new sjcl.bn(this).normalize(),b=0;
        for(;a.greaterEquals(c);b++){
            c.doubleM()
            }
            for(;b>0;b--){
            c.halveM();
            if(a.greaterEquals(c)){
                a.subM(c).normalize()
                }
            }
        return a.trim()
    },
inverseMod:function(h){
    var e=new sjcl.bn(1),d=new sjcl.bn(0),c=new sjcl.bn(this),k=new sjcl.bn(h),g,f,j=1;
    if(!(h.limbs[0]&1)){
        //throw (new sjcl.exception.invalid("inverseMod: p must be odd"))
        }
        do{
        if(c.limbs[0]&1){
            if(!c.greaterEquals(k)){
                g=c;
                c=k;
                k=g;
                g=e;
                e=d;
                d=g
                }
                c.subM(k);
            c.normalize();
            if(!e.greaterEquals(d)){
                e.addM(h)
                }
                e.subM(d)
            }
            c.halveM();
        if(e.limbs[0]&1){
            e.addM(h)
            }
            e.normalize();
        e.halveM();
        for(f=j=0;f<c.limbs.length;f++){
            j|=c.limbs[f]
            }
        }while(j);
    if(!k.equals(1)){
    //throw (new sjcl.exception.invalid("inverseMod: p and x must be relatively prime"))
    }
    return d
},
add:function(a){
    return this.copy().addM(a)
    },
sub:function(a){
    return this.copy().subM(a)
    },
mul:function(k){
    if(typeof(k)==="number"){
        k=new this._class(k)
        }
        var g,e,o=this.limbs,n=k.limbs,h=o.length,d=n.length,f=new this._class(),m=f.limbs,l,p=this.maxMul;
    for(g=0;g<this.limbs.length+k.limbs.length+1;g++){
        m[g]=0
        }
        for(g=0;g<h;g++){
        l=o[g];
        for(e=0;e<d;e++){
            m[g+e]+=l*n[e]
            }
            if(!--p){
            p=this.maxMul;
            f.cnormalize()
            }
        }
    return f.cnormalize().reduce()
},
square:function(){
    return this.mul(this)
    },
power:function(a){
    if(typeof(a)==="number"){
        a=[a]
        }else{
        if(a.limbs!==undefined){
            a=a.normalize().limbs
            }
        }
    var d,c,b=new this._class(1),e=this;
for(d=0;d<a.length;d++){
    for(c=0;c<this.radix;c++){
        if(a[d]&(1<<c)){
            b=b.mul(e)
            }
            e=e.square()
        }
    }
    return b
},
mulmod:function(a,b){
    return this.mod(b).mul(a.mod(b)).mod(b)
    },
powermod:function(c,f){
    var b=new sjcl.bn(1),d=new sjcl.bn(this),e=new sjcl.bn(c);
    while(true){
        if(e.limbs[0]&1){
            b=b.mulmod(d,f)
            }
            e.halveM();
        if(e.equals(0)){
            break
        }
        d=d.mulmod(d,f)
        }
        return b.normalize().reduce()
    },
trim:function(){
    var a=this.limbs,b;
    do{
        b=a.pop()
        }while(a.length&&b===0);
    a.push(b);
    return this
    },
reduce:function(){
    return this
    },
fullReduce:function(){
    return this.normalize()
    },
normalize:function(){
    var h=0,c,g=this.placeVal,e=this.ipv,b,a,f=this.limbs,d=f.length,j=this.radixMask;
    for(c=0;c<d||(h!==0&&h!==-1);c++){
        b=(f[c]||0)+h;
        a=f[c]=b&j;
        h=(b-a)*e
        }
        if(h===-1){
        f[c-1]-=this.placeVal
        }
        return this
    },
cnormalize:function(){
    var g=0,e,d=this.ipv,c,a,h=this.limbs,f=h.length,b=this.radixMask;
    for(e=0;e<f-1;e++){
        c=h[e]+g;
        a=h[e]=c&b;
        g=(c-a)*d
        }
        h[e]+=g;
    return this
    },
toBits:function(a){
    this.fullReduce();
    a=a||this.exponent||this.limbs.length*this.radix;
    var d=Math.floor((a-1)/24),b=sjcl.bitArray,f=(a+7&-8)%this.radix||this.radix,c=[b.partial(f,this.getLimb(d))];
    for(d--;d>=0;d--){
        c=b.concat(c,[b.partial(this.radix,this.getLimb(d))])
        }
        return c
    },
bitLength:function(){
    this.fullReduce();
    var c=this.radix*(this.limbs.length-1),a=this.limbs[this.limbs.length-1];
    for(;a;a>>=1){
        c++
    }
    return c+7&-8
    }
};

sjcl.bn.fromBits=function(g){
    var c=this,d=new c(),i=[],b=sjcl.bitArray,f=this.prototype,a=Math.min(this.bitLength||0x100000000,b.bitLength(g)),h=a%f.radix||f.radix;
    i[0]=b.extract(g,0,h);
    for(;h<a;h+=f.radix){
        i.unshift(b.extract(g,h,f.radix))
        }
        d.limbs=i;
    return d
    };
    
sjcl.bn.prototype.ipv=1/(sjcl.bn.prototype.placeVal=Math.pow(2,sjcl.bn.prototype.radix));
sjcl.bn.prototype.radixMask=(1<<sjcl.bn.prototype.radix)-1;
sjcl.bn.pseudoMersennePrime=function(f,b){
    function g(h){
        this.initWith(h)
        }
        var a=g.prototype=new sjcl.bn(),d,c,e;
    e=a.modOffset=Math.ceil(c=f/a.radix);
    a.exponent=f;
    a.offset=[];
    a.factor=[];
    a.minOffset=e;
    a.fullMask=0;
    a.fullOffset=[];
    a.fullFactor=[];
    a.modulus=g.modulus=new sjcl.bn(Math.pow(2,f));
    a.fullMask=0|-Math.pow(2,f%a.radix);
    for(d=0;d<b.length;d++){
        a.offset[d]=Math.floor(b[d][0]/a.radix-c);
        a.fullOffset[d]=Math.ceil(b[d][0]/a.radix-c);
        a.factor[d]=b[d][1]*Math.pow(1/2,f-b[d][0]+a.offset[d]*a.radix);
        a.fullFactor[d]=b[d][1]*Math.pow(1/2,f-b[d][0]+a.fullOffset[d]*a.radix);
        a.modulus.addM(new sjcl.bn(Math.pow(2,b[d][0])*b[d][1]));
        a.minOffset=Math.min(a.minOffset,-a.offset[d])
        }
        a._class=g;
    a.modulus.cnormalize();
    a.reduce=function(){
        var q,p,o,n=this.modOffset,t=this.limbs,j,m=this.offset,r=this.offset.length,h=this.factor,s;
        q=this.minOffset;
        while(t.length>n){
            o=t.pop();
            s=t.length;
            for(p=0;p<r;p++){
                t[s+m[p]]-=h[p]*o
                }
                q--;
            if(!q){
                t.push(0);
                this.cnormalize();
                q=this.minOffset
                }
            }
        this.cnormalize();
    return this
    };
    
a._strongReduce=(a.fullMask===-1)?a.reduce:function(){
    var n=this.limbs,m=n.length-1,j,h;
    this.reduce();
    if(m===this.modOffset-1){
        h=n[m]&this.fullMask;
        n[m]-=h;
        for(j=0;j<this.fullOffset.length;j++){
            n[m+this.fullOffset[j]]-=this.fullFactor[j]*h
            }
            this.normalize()
        }
    };

a.fullReduce=function(){
    var j,h;
    this._strongReduce();
    this.addM(this.modulus);
    this.addM(this.modulus);
    this.normalize();
    this._strongReduce();
    for(h=this.limbs.length;h<this.modOffset;h++){
        this.limbs[h]=0
        }
        j=this.greaterEquals(this.modulus);
    for(h=0;h<this.limbs.length;h++){
        this.limbs[h]-=this.modulus.limbs[h]*j
        }
        this.cnormalize();
    return this
    };
    
a.inverse=function(){
    return(this.power(this.modulus.sub(2)))
    };
    
g.fromBits=sjcl.bn.fromBits;
return g
};

sjcl.bn.prime={
    p127:sjcl.bn.pseudoMersennePrime(127,[[0,-1]]),
    p25519:sjcl.bn.pseudoMersennePrime(255,[[0,-19]]),
    p192:sjcl.bn.pseudoMersennePrime(192,[[0,-1],[64,-1]]),
    p224:sjcl.bn.pseudoMersennePrime(224,[[0,1],[96,-1]]),
    p256:sjcl.bn.pseudoMersennePrime(0x100,[[0,-1],[96,1],[192,1],[224,-1]]),
    p384:sjcl.bn.pseudoMersennePrime(384,[[0,-1],[32,1],[96,-1],[128,-1]]),
    p521:sjcl.bn.pseudoMersennePrime(521,[[0,-1]])
    };
    
sjcl.bn.random=function(c,f){
    if(typeof c!=="object"){
        c=new sjcl.bn(c)
        }
        var g,e,b=c.limbs.length,a=c.limbs[b-1]+1,d=new sjcl.bn();
    while(true){
        do{
            g=sjcl.random.randomWords(b,f);
            if(g[b-1]<0){
                g[b-1]+=0x100000000
                }
            }while(Math.floor(g[b-1]/a)===Math.floor(0x100000000/a));
    g[b-1]%=a;
    for(e=0;e<b-1;e++){
        g[e]&=c.radixMask
        }
        d.limbs=g;
    if(!d.greaterEquals(c)){
        return d
        }
    }
};

sjcl.ecc={};
    
sjcl.ecc.point=function(b,a,c){
    if(a===undefined){
        this.isIdentity=true
        }else{
        this.x=a;
        this.y=c;
        this.isIdentity=false
        }
        this.curve=b
    };
    
sjcl.ecc.point.prototype={
    toJac:function(){
        return new sjcl.ecc.pointJac(this.curve,this.x,this.y,new this.curve.field(1))
        },
    mult:function(a){
        return this.toJac().mult(a,this).toAffine()
        },
    mult2:function(a,c,b){
        return this.toJac().mult2(a,this,c,b).toAffine()
        },
    multiples:function(){
        var a,c,b;
        if(this._multiples===undefined){
            b=this.toJac().doubl();
            a=this._multiples=[new sjcl.ecc.point(this.curve),this,b.toAffine()];
            for(c=3;c<16;c++){
                b=b.add(this);
                a.push(b.toAffine())
                }
            }
            return this._multiples
    },
isValid:function(){
    return this.y.square().equals(this.curve.b.add(this.x.mul(this.curve.a.add(this.x.square()))))
    },
toBits:function(){
    return sjcl.bitArray.concat(this.x.toBits(),this.y.toBits())
    }
};

sjcl.ecc.pointJac=function(c,a,d,b){
    if(a===undefined){
        this.isIdentity=true
        }else{
        this.x=a;
        this.y=d;
        this.z=b;
        this.isIdentity=false
        }
        this.curve=c
    };
    
sjcl.ecc.pointJac.prototype={
    add:function(e){
        var g=this,f,k,i,h,b,a,o,n,m,l,j;
        if(g.curve!==e.curve){
            //throw ("sjcl.ecc.add(): Points must be on the same curve to add them!")
            }
            if(g.isIdentity){
            return e.toJac()
            }else{
            if(e.isIdentity){
                return g
                }
            }
        f=g.z.square();
    k=e.x.mul(f).subM(g.x);
    if(k.equals(0)){
        if(g.y.equals(e.y.mul(f.mul(g.z)))){
            return g.doubl()
            }else{
            return new sjcl.ecc.pointJac(g.curve)
            }
        }
    i=e.y.mul(f.mul(g.z)).subM(g.y);
    h=k.square();
    b=i.square();
    a=k.square().mul(k).addM(g.x.add(g.x).mul(h));
    o=b.subM(a);
    n=g.x.mul(h).subM(o).mul(i);
    m=g.y.mul(k.square().mul(k));
    l=n.subM(m);
    j=g.z.mul(k);
    return new sjcl.ecc.pointJac(this.curve,o,l,j)
    },
doubl:function(){
    if(this.isIdentity){
        return this
        }
        var g=this.y.square(),f=g.mul(this.x.mul(4)),e=g.square().mul(8),h=this.z.square(),k=this.x.sub(h).mul(3).mul(this.x.add(h)),d=k.square().subM(f).subM(f),j=f.sub(d).mul(k).subM(e),i=this.y.add(this.y).mul(this.z);
    return new sjcl.ecc.pointJac(this.curve,d,j,i)
    },
toAffine:function(){
    if(this.isIdentity||this.z.equals(0)){
        return new sjcl.ecc.point(this.curve)
        }
        var b=this.z.inverse(),a=b.square();
    return new sjcl.ecc.point(this.curve,this.x.mul(a).fullReduce(),this.y.mul(a.mul(b)).fullReduce())
    },
mult:function(a,e){
    if(typeof(a)==="number"){
        a=[a]
        }else{
        if(a.limbs!==undefined){
            a=a.normalize().limbs
            }
        }
    var d,c,b=new sjcl.ecc.point(this.curve).toJac(),f=e.multiples();
for(d=a.length-1;d>=0;d--){
    for(c=sjcl.bn.prototype.radix-4;c>=0;c-=4){
        b=b.doubl().doubl().doubl().doubl().add(f[a[d]>>c&15])
        }
    }
    return b
},
mult2:function(k,g,h,b){
    if(typeof(k)==="number"){
        k=[k]
        }else{
        if(k.limbs!==undefined){
            k=k.normalize().limbs
            }
        }
    if(typeof(h)==="number"){
    h=[h]
    }else{
    if(h.limbs!==undefined){
        h=h.normalize().limbs
        }
    }
var f,d,e=new sjcl.ecc.point(this.curve).toJac(),m=g.multiples(),l=b.multiples(),c,a;
for(f=Math.max(k.length,h.length)-1;f>=0;f--){
    c=k[f]|0;
    a=h[f]|0;
    for(d=sjcl.bn.prototype.radix-4;d>=0;d-=4){
        e=e.doubl().doubl().doubl().doubl().add(m[c>>d&15]).add(l[a>>d&15])
        }
    }
    return e
},
isValid:function(){
    var c=this.z.square(),b=c.square(),a=b.mul(c);
    return this.y.square().equals(this.curve.b.mul(a).add(this.x.mul(this.curve.a.mul(b).add(this.x.square()))))
    }
};

sjcl.ecc.curve=function(g,e,f,d,c,h){
    this.field=g;
    this.r=g.prototype.modulus.sub(e);
    this.a=new g(f);
    this.b=new g(d);
    this.G=new sjcl.ecc.point(this,new g(c),new g(h))
    };
    
sjcl.ecc.curve.prototype.fromBits=function(c){
    var b=sjcl.bitArray,a=this.field.prototype.exponent+7&-8,d=new sjcl.ecc.point(this,this.field.fromBits(b.bitSlice(c,0,a)),this.field.fromBits(b.bitSlice(c,a,2*a)));
    if(!d.isValid()){
        //throw new sjcl.exception.corrupt("not on the curve!")
        }
        return d
    };
    
sjcl.ecc.curves={
    c192:new sjcl.ecc.curve(sjcl.bn.prime.p192,"0x662107c8eb94364e4b2dd7ce",-3,"0x64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1","0x188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012","0x07192b95ffc8da78631011ed6b24cdd573f977a11e794811"),
    c224:new sjcl.ecc.curve(sjcl.bn.prime.p224,"0xe95c1f470fc1ec22d6baa3a3d5c4",-3,"0xb4050a850c04b3abf54132565044b0b7d7bfd8ba270b39432355ffb4","0xb70e0cbd6bb4bf7f321390b94a03c1d356c21122343280d6115c1d21","0xbd376388b5f723fb4c22dfe6cd4375a05a07476444d5819985007e34"),
    c256:new sjcl.ecc.curve(sjcl.bn.prime.p256,"0x4319055358e8617b0c46353d039cdaae",-3,"0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b","0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296","0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5"),
    c384:new sjcl.ecc.curve(sjcl.bn.prime.p384,"0x389cb27e0bc8d21fa7e5f24cb74f58851313e696333ad68c",-3,"0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef","0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7","0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f")
    };
    
sjcl.ecc._dh=function(a){
    sjcl.ecc[a]={
        publicKey:function(c,d,b){
            this._curve=d;
            if(b instanceof Array){
                this._point=d.fromBits(b)
                }else{
                this._point=b
                }
                if(c){
                this._curve_id=c;
                this.serialize=function(){
                    return{
                        point:b.toBits(),
                        curve:c
                    }
                }
            }
    },
secretKey:function(c,d,b){
    this._curve=d;
    this._exponent=b;
    if(c){
        this._curve_id=c;
        this.serialize=function(){
            return{
                exponent:b.toBits(),
                curve:c
            }
        }
    }
},
generateKeys:function(f,d){
    var e;
    if(f===undefined){
        f=0x100
        }
        if(typeof f==="number"){
        e=f;
        f=sjcl.ecc.curves["c"+f];
        if(f===undefined){
            //throw new sjcl.exception.invalid("no such curve")
            }
        }
    var b=sjcl.bn.random(f.r,d),c=f.G.mult(b);
return{
    pub:new sjcl.ecc[a].publicKey(e,f,c),
    sec:new sjcl.ecc[a].secretKey(e,f,b)
    }
}
}
};

sjcl.ecc._dh("elGamal");
sjcl.ecc.elGamal.publicKey.prototype={
    kem:function(d){
        var c=sjcl.bn.random(this._curve.r,d),a=this._curve.G.mult(c).toBits(),b=sjcl.hash.sha256.hash(this._point.mult(c).toBits());
        return{
            key:b,
            tag:a
        }
    }
};

sjcl.ecc.elGamal.secretKey.prototype={
    unkem:function(a){
        return sjcl.hash.sha256.hash(this._curve.fromBits(a).mult(this._exponent).toBits())
        },
    dh:function(a){
        return sjcl.hash.sha256.hash(a._point.mult(this._exponent).toBits())
        }
    };

sjcl.ecc._dh("ecdsa");
sjcl.ecc.ecdsa.secretKey.prototype={
    sign:function(g,f){
        var d=this._curve.r,a=d.bitLength(),b=sjcl.bn.random(d.sub(1),f).add(1),e=this._curve.G.mult(b).x.mod(d),c=sjcl.bn.fromBits(g).add(e.mul(this._exponent)).inverseMod(d).mul(b).mod(d);
        return sjcl.bitArray.concat(e.toBits(a),c.toBits(a))
        }
    };

sjcl.ecc.ecdsa.publicKey.prototype={
    verify:function(e,d){
        var h=sjcl.bitArray,f=this._curve.r,c=f.bitLength(),a=sjcl.bn.fromBits(h.bitSlice(d,0,c)),j=sjcl.bn.fromBits(h.bitSlice(d,c,2*c)),g=sjcl.bn.fromBits(e).mul(j).mod(f),i=a.mul(j).mod(f),b=this._curve.G.mult2(g,i,this._point).x;
        if(a.equals(0)||j.equals(0)||a.greaterEquals(f)||j.greaterEquals(f)||!b.equals(a)){
            //throw (new sjcl.exception.corrupt("signature didn't check out"))
            }
            return true
        }
    };