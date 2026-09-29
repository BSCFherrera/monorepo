import{j as o}from"./jsx-runtime-Cnbe3ryz.js";import{g as s}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{d as m,C as d}from"./CommonDialogExample-CoQMMs56.js";import{B as c}from"./BrandPlaceholder-Q8OEJdWw.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const x={title:"Modals/Dialog Recipes/Client Verification/ClientVerifiedModal",component:s,args:{...m,title:"Confirm your information",message:"Please confirm that the following demo profile belongs to you.",details:[{label:"Display name",value:"Example Participant"}],secondaryLabel:"This is not me",onSecondary:()=>{},logo:o.jsx(c,{})},parameters:{layout:"fullscreen"}},e={parameters:{docs:{source:{code:`<ClientVerifiedModal
  visible={visible}
  onClose={handleClose}
  onSecondary={handleReject}
  title="Confirm your information"
  message="Please confirm that the following demo profile belongs to you."
  details={[{ label: 'Display name', value: 'Example Participant' }]}
  secondaryLabel="This is not me"
  logo={<BrandLogo />}
/>`}}},render:n=>o.jsx(d,{children:(t,a)=>o.jsx(s,{...n,visible:t,onClose:a,onSecondary:a})})};var i,l,r;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<ClientVerifiedModal
  visible={visible}
  onClose={handleClose}
  onSecondary={handleReject}
  title="Confirm your information"
  message="Please confirm that the following demo profile belongs to you."
  details={[{ label: 'Display name', value: 'Example Participant' }]}
  secondaryLabel="This is not me"
  logo={<BrandLogo />}
/>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <ClientVerifiedModal {...args} visible={visible} onClose={onClose} onSecondary={onClose} />}</CommonDialogExample>
}`,...(r=(l=e.parameters)==null?void 0:l.docs)==null?void 0:r.source}}};const v=["Default"];export{e as Default,v as __namedExportsOrder,x as default};
