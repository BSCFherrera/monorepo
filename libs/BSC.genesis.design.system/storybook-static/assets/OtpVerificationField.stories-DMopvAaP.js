import{j as r}from"./jsx-runtime-Cnbe3ryz.js";import{r as t}from"./index-3dRrDZpt.js";import{w as j}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const W={title:"Verification/OtpVerificationField",component:j,args:{value:"",onChange:()=>{},onVerify:()=>{},options:[{label:"Demo destination A",value:0},{label:"Demo destination B",value:1}],selectedValue:0}};function c(e){const[v,i]=t.useState(e.value),[D,b]=t.useState(e.codeSent??!1),[R,O]=t.useState(!1),[T,k]=t.useState(0);return r.jsx(j,{...e,value:v,onChange:i,codeSent:D,verified:R,selectedValue:T,onSelect:k,onSend:()=>b(!0),onResend:()=>i(""),onVerify:()=>O(!0),sentText:"A demo code was prepared for the selected destination."})}const s={render:e=>r.jsx(c,{...e})},a={args:{codeSent:!0,error:!0,errorText:"Please check the six-digit demo code."},render:e=>r.jsx(c,{...e})},n={args:{codeSent:!0,timer:{finished:!1,label:"00:45"}},render:e=>r.jsx(c,{...e})},o={args:{codeSent:!0},render:e=>r.jsx(c,{...e})};var d,l,m;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: args => <Example {...args} />
}`,...(m=(l=s.parameters)==null?void 0:l.docs)==null?void 0:m.source}}};var u,p,g;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    codeSent: true,
    error: true,
    errorText: 'Please check the six-digit demo code.'
  },
  render: args => <Example {...args} />
}`,...(g=(p=a.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var S,f,x;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    codeSent: true,
    timer: {
      finished: false,
      label: '00:45'
    }
  },
  render: args => <Example {...args} />
}`,...(x=(f=n.parameters)==null?void 0:f.docs)==null?void 0:x.source}}};var h,E,V;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    codeSent: true
  },
  render: args => <Example {...args} />
}`,...(V=(E=o.parameters)==null?void 0:E.docs)==null?void 0:V.source}}};const _=["Default","WithError","SentState","Resend"];export{s as Default,o as Resend,n as SentState,a as WithError,_ as __namedExportsOrder,W as default};
