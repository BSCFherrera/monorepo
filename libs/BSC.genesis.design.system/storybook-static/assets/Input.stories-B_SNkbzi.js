import{j as b}from"./jsx-runtime-Cnbe3ryz.js";import{r as T}from"./index-3dRrDZpt.js";import{p as h}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const C={title:"Forms/Input",component:h,argTypes:{label:{control:"text"},error:{control:"text"},helperText:{control:"text"},disabled:{control:"boolean"},readOnly:{control:"boolean"}},args:{label:"Display name",helperText:"Use a public nickname."}};function R(t){const[y,v]=T.useState("");return b.jsx(h,{...t,value:y,onChangeText:v})}const e={render:t=>b.jsx(R,{...t})},r={args:{error:"This field is required.",helperText:void 0}},a={args:{value:"Read only content",disabled:!0}},o={args:{value:"Reference value",readOnly:!0}};var s,n,l;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: args => <ControlledInput {...args} />
}`,...(l=(n=e.parameters)==null?void 0:n.docs)==null?void 0:l.source}}};var c,d,p;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    error: 'This field is required.',
    helperText: undefined
  }
}`,...(p=(d=r.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};var u,i,m;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    value: 'Read only content',
    disabled: true
  }
}`,...(m=(i=a.parameters)==null?void 0:i.docs)==null?void 0:m.source}}};var g,x,f;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    value: 'Reference value',
    readOnly: true
  }
}`,...(f=(x=o.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};const q=["Default","WithError","Disabled","ReadOnly"];export{e as Default,a as Disabled,o as ReadOnly,r as WithError,q as __namedExportsOrder,C as default};
