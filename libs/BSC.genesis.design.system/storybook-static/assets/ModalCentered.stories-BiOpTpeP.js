import{j as o}from"./jsx-runtime-Cnbe3ryz.js";import{s as a,a as i}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{C as c}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const M={title:"Modals/Compatibility/ModalCentered",component:a,args:{visible:!0,onClose:()=>{}},tags:["compatibility","deprecated"],parameters:{layout:"fullscreen",docs:{description:{component:"Compatibility wrapper kept for existing consumers. Prefer CenteredModal for new centered surfaces; ModalCentered delegates to that shared surface and keeps the older onClose/closeOnBackdropPress prop names."}}}},e={parameters:{docs:{source:{code:`<ModalCentered visible={visible} onClose={handleClose}>
  <Text>A compact, content-sized surface.</Text>
</ModalCentered>`}}},render:n=>o.jsx(c,{children:(l,d)=>o.jsx(a,{...n,visible:l,onClose:d,children:o.jsx(i,{children:"A compact, content-sized surface."})})})};var r,s,t;e.parameters={...e.parameters,docs:{...(r=e.parameters)==null?void 0:r.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<ModalCentered visible={visible} onClose={handleClose}>
  <Text>A compact, content-sized surface.</Text>
</ModalCentered>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <ModalCentered {...args} visible={visible} onClose={onClose}><Text>A compact, content-sized surface.</Text></ModalCentered>}</CommonDialogExample>
}`,...(t=(s=e.parameters)==null?void 0:s.docs)==null?void 0:t.source}}};const g=["Default"];export{e as Default,g as __namedExportsOrder,M as default};
