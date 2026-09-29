import{j as p}from"./jsx-runtime-Cnbe3ryz.js";import{r as v}from"./index-3dRrDZpt.js";import{Q as g}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const T={title:"Forms/TextField",component:g,args:{placeholder:"Type here..."}};function b(s){const[x,f]=v.useState("");return p.jsx(g,{...s,value:x,onChangeText:f})}const e={render:s=>p.jsx(b,{...s})},r={args:{value:"Disabled content",disabled:!0}},a={args:{value:"Invalid",error:!0}};var t,o,n;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`{
  render: args => <ControlledField {...args} />
}`,...(n=(o=e.parameters)==null?void 0:o.docs)==null?void 0:n.source}}};var d,l,c;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    value: 'Disabled content',
    disabled: true
  }
}`,...(c=(l=r.parameters)==null?void 0:l.docs)==null?void 0:c.source}}};var i,m,u;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    value: 'Invalid',
    error: true
  }
}`,...(u=(m=a.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};const C=["Default","Disabled","WithError"];export{e as Default,r as Disabled,a as WithError,C as __namedExportsOrder,T as default};
