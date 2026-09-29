import{j as s}from"./jsx-runtime-Cnbe3ryz.js";import{r as f}from"./index-3dRrDZpt.js";import{S as g}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const y={title:"Selection/Select",component:g,args:{onChange:()=>{},label:"Frequency",placeholder:"Choose an option",options:[{label:"Never",value:0},{label:"Weekly",value:1},{label:"Monthly",value:2},{label:"Unavailable",value:3,disabled:!0}]}};function b(e){const[S,x]=f.useState(null);return s.jsx(g,{...e,value:S,onChange:x})}const r={render:e=>s.jsx(b,{...e})},a={args:{disabled:!0}},o={render:e=>s.jsx(b,{...e,error:!0})};var t,l,n;r.parameters={...r.parameters,docs:{...(t=r.parameters)==null?void 0:t.docs,source:{originalSource:`{
  render: args => <ControlledSelect {...args} />
}`,...(n=(l=r.parameters)==null?void 0:l.docs)==null?void 0:n.source}}};var c,d,u;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...(u=(d=a.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var i,p,m;o.parameters={...o.parameters,docs:{...(i=o.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <ControlledSelect {...args} error />
}`,...(m=(p=o.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};const W=["Default","Disabled","WithError"];export{r as Default,a as Disabled,o as WithError,W as __namedExportsOrder,y as default};
