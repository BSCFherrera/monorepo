import{j as n}from"./jsx-runtime-Cnbe3ryz.js";import{r as F}from"./index-3dRrDZpt.js";import{v as D}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const q={title:"Verification/OtpInput",component:D,args:{length:6,value:"",onChange:()=>{}}};function c(r){const[E,b]=F.useState("");return n.jsx(D,{...r,value:E,onChange:b})}const e={render:r=>n.jsx(c,{...r})},s={render:r=>n.jsx(c,{...r,error:!0})},a={args:{value:"123456",success:!0}},t={args:{value:"123456",disabled:!0}},o={render:r=>n.jsx(c,{...r,length:4})};var u,p,d;e.parameters={...e.parameters,docs:{...(u=e.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: args => <ControlledOtp {...args} />
}`,...(d=(p=e.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};var m,i,l;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: args => <ControlledOtp {...args} error />
}`,...(l=(i=s.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};var g,x,f;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    value: '123456',
    success: true
  }
}`,...(f=(x=a.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};var S,h,v;t.parameters={...t.parameters,docs:{...(S=t.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    value: '123456',
    disabled: true
  }
}`,...(v=(h=t.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};var O,j,C;o.parameters={...o.parameters,docs:{...(O=o.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: args => <ControlledOtp {...args} length={4} />
}`,...(C=(j=o.parameters)==null?void 0:j.docs)==null?void 0:C.source}}};const w=["Default","WithError","Success","Disabled","FourDigits"];export{e as Default,t as Disabled,o as FourDigits,a as Success,s as WithError,w as __namedExportsOrder,q as default};
