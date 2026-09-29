import{v as ee}from"./v4-CtRu48qb.js";import{b as re}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import"./jsx-runtime-Cnbe3ryz.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const{addons:te}=__STORYBOOK_MODULE_PREVIEW_API__,{ImplicitActionsDuringRendering:ae}=__STORYBOOK_MODULE_CORE_EVENTS_PREVIEW_ERRORS__,{global:h}=__STORYBOOK_MODULE_GLOBAL__;var oe=Object.defineProperty,se=(r,e)=>{for(var t in e)oe(r,t,{get:e[t],enumerable:!0})},ne="storybook/actions",ie=`${ne}/action-event`,ce={depth:10,clearOnStoryChange:!0,limit:50},J=(r,e)=>{let t=Object.getPrototypeOf(r);return!t||e(t)?t:J(t,e)},le=r=>!!(typeof r=="object"&&r&&J(r,e=>/^Synthetic(?:Base)?Event$/.test(e.constructor.name))&&typeof r.persist=="function"),pe=r=>{if(le(r)){let e=Object.create(r.constructor.prototype,Object.getOwnPropertyDescriptors(r));e.persist();let t=Object.getOwnPropertyDescriptor(e,"view"),a=t==null?void 0:t.value;return typeof a=="object"&&(a==null?void 0:a.constructor.name)==="Window"&&Object.defineProperty(e,"view",{...t,value:Object.create(a.constructor.prototype)}),e}return r},de=()=>typeof crypto=="object"&&typeof crypto.getRandomValues=="function"?ee():Date.now().toString(36)+Math.random().toString(36).substring(2);function y(r,e={}){let t={...ce,...e},a=function(...s){var S,E;if(e.implicit){let R=(S="__STORYBOOK_PREVIEW__"in h?h.__STORYBOOK_PREVIEW__:void 0)==null?void 0:S.storyRenders.find(c=>c.phase==="playing"||c.phase==="rendering");if(R){let c=!((E=globalThis==null?void 0:globalThis.FEATURES)!=null&&E.disallowImplicitActionsInRenderV8),T=new ae({phase:R.phase,name:r,deprecated:c});if(c)console.warn(T);else throw T}}let o=te.getChannel(),n=de(),i=5,b=s.map(pe),X=s.length>1?b:b[0],Z={id:n,count:0,data:{name:r,args:X},options:{...t,maxDepth:i+(t.depth||3),allowFunction:t.allowFunction||!1}};o.emit(ie,Z)};return a.isAction=!0,a.implicit=e.implicit,a}const{definePreview:ve}=__STORYBOOK_MODULE_PREVIEW_API__,{global:f}=__STORYBOOK_MODULE_GLOBAL__;var ge={};se(ge,{argsEnhancers:()=>me,loaders:()=>ye});var Q=(r,e)=>typeof e[r]>"u"&&!(r in e),ue=r=>{let{initialArgs:e,argTypes:t,id:a,parameters:{actions:s}}=r;if(!s||s.disable||!s.argTypesRegex||!t)return{};let o=new RegExp(s.argTypesRegex);return Object.entries(t).filter(([n])=>!!o.test(n)).reduce((n,[i,b])=>(Q(i,e)&&(n[i]=y(i,{implicit:!0,id:a})),n),{})},_e=r=>{let{initialArgs:e,argTypes:t,parameters:{actions:a}}=r;return a!=null&&a.disable||!t?{}:Object.entries(t).filter(([s,o])=>!!o.action).reduce((s,[o,n])=>(Q(o,e)&&(s[o]=y(typeof n.action=="string"?n.action:o)),s),{})},me=[_e,ue],v=!1,Oe=r=>{let{parameters:{actions:e}}=r;if(!(e!=null&&e.disable)&&!v&&"__STORYBOOK_TEST_ON_MOCK_CALL__"in f&&typeof f.__STORYBOOK_TEST_ON_MOCK_CALL__=="function"){let t=f.__STORYBOOK_TEST_ON_MOCK_CALL__;t((a,s)=>{let o=a.getMockName();o!=="spy"&&(!/^next\/.*::/.test(o)||["next/router::useRouter()","next/navigation::useRouter()","next/navigation::redirect","next/cache::","next/headers::cookies().set","next/headers::cookies().delete","next/headers::headers().set","next/headers::headers().delete"].some(n=>o.startsWith(n)))&&y(o)(s)}),v=!0}},ye=[Oe];const xe={title:"Actions/Button",component:re,argTypes:{label:{control:"text"},variant:{control:"inline-radio",options:["primary","secondary","text"]},size:{control:"inline-radio",options:["small","medium","large"]},disabled:{control:"boolean"},loading:{control:"boolean"},pill:{control:"boolean"},fullWidth:{control:"boolean"},onPress:{control:!1}},args:{label:"Save",onPress:()=>y("Button pressed")()}},l={args:{variant:"primary"}},p={args:{variant:"secondary"}},d={args:{variant:"text",label:"Text button"}},g={args:{size:"small"}},u={args:{size:"large"}},_={args:{pill:!0,label:"Pill button"}},m={args:{disabled:!0}},O={args:{loading:!0}};var x,A,P;l.parameters={...l.parameters,docs:{...(x=l.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    variant: 'primary'
  }
}`,...(P=(A=l.parameters)==null?void 0:A.docs)==null?void 0:P.source}}};var L,D,B;p.parameters={...p.parameters,docs:{...(L=p.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    variant: 'secondary'
  }
}`,...(B=(D=p.parameters)==null?void 0:D.docs)==null?void 0:B.source}}};var I,w,K;d.parameters={...d.parameters,docs:{...(I=d.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    variant: 'text',
    label: 'Text button'
  }
}`,...(K=(w=d.parameters)==null?void 0:w.docs)==null?void 0:K.source}}};var j,M,C;g.parameters={...g.parameters,docs:{...(j=g.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    size: 'small'
  }
}`,...(C=(M=g.parameters)==null?void 0:M.docs)==null?void 0:C.source}}};var V,Y,W;u.parameters={...u.parameters,docs:{...(V=u.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    size: 'large'
  }
}`,...(W=(Y=u.parameters)==null?void 0:Y.docs)==null?void 0:W.source}}};var z,N,U;_.parameters={..._.parameters,docs:{...(z=_.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    pill: true,
    label: 'Pill button'
  }
}`,...(U=(N=_.parameters)==null?void 0:N.docs)==null?void 0:U.source}}};var k,F,$;m.parameters={...m.parameters,docs:{...(k=m.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...($=(F=m.parameters)==null?void 0:F.docs)==null?void 0:$.source}}};var G,q,H;O.parameters={...O.parameters,docs:{...(G=O.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...(H=(q=O.parameters)==null?void 0:q.docs)==null?void 0:H.source}}};const Ae=["Primary","Secondary","TextVariant","Small","Large","Pill","Disabled","Loading"];export{m as Disabled,u as Large,O as Loading,_ as Pill,l as Primary,p as Secondary,g as Small,d as TextVariant,Ae as __namedExportsOrder,xe as default};
