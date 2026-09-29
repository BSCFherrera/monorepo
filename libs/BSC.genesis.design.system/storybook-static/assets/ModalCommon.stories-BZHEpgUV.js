import{j as e}from"./jsx-runtime-Cnbe3ryz.js";import{t as a,a as i}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{C as d}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const f={title:"Modals/Compatibility/ModalCommon",component:a,args:{visible:!0,onClose:()=>{}},tags:["compatibility","deprecated"],parameters:{layout:"fullscreen",docs:{description:{component:"Compatibility wrapper kept for existing consumers. Prefer BottomSheetModal for new bottom-aligned surfaces; ModalCommon delegates to that shared surface and keeps the older onClose/closeOnBackdropPress prop names."}}}},o={parameters:{docs:{source:{code:`<ModalCommon visible={visible} onClose={handleClose}>
  <Text>Content supplied by the host.</Text>
</ModalCommon>`}}},render:n=>e.jsx(d,{children:(l,m)=>e.jsx(a,{...n,visible:l,onClose:m,children:e.jsx(i,{children:"Content supplied by the host, without a forced heading or close control."})})})};var t,s,r;o.parameters={...o.parameters,docs:{...(t=o.parameters)==null?void 0:t.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<ModalCommon visible={visible} onClose={handleClose}>
  <Text>Content supplied by the host.</Text>
</ModalCommon>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <ModalCommon {...args} visible={visible} onClose={onClose}><Text>Content supplied by the host, without a forced heading or close control.</Text></ModalCommon>}</CommonDialogExample>
}`,...(r=(s=o.parameters)==null?void 0:s.docs)==null?void 0:r.source}}};const g=["Default"];export{o as Default,g as __namedExportsOrder,f as default};
