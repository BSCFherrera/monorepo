import{j as n}from"./jsx-runtime-Cnbe3ryz.js";import{K as a}from"./index-Ct6YQRae.js";import"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import{C as l}from"./CommonDialogExample-CoQMMs56.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const u={title:"Modals/Dialog Recipes/Terms/TermsAndConditionsModal",component:a,args:{visible:!0,onClose:()=>{},onAccept:()=>{},title:"Demo participation information",content:`This is synthetic display content, not legal advice or a service agreement. Review how the example arranges longer paragraphs before adding your own approved content.

The host application owns acceptance, persistence, and any decision to continue. This catalog does not send information to a service or store an acceptance record.`},parameters:{layout:"fullscreen",docs:{description:{component:"Named terms recipe built on the shared ModalCommon surface. Prefer this over the generic ContentModal adapter for terms-specific flows."}}}},e={parameters:{docs:{source:{code:`<TermsAndConditionsModal
  visible={visible}
  onClose={handleClose}
  onAccept={handleAccept}
  title="Demo participation information"
  content={termsContent}
/>`}}},render:i=>n.jsx(l,{children:(c,o)=>n.jsx(a,{...i,visible:c,onClose:o,onAccept:o})})};var t,r,s;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<TermsAndConditionsModal
  visible={visible}
  onClose={handleClose}
  onAccept={handleAccept}
  title="Demo participation information"
  content={termsContent}
/>\`
      }
    }
  },
  render: args => <CommonDialogExample>{(visible, onClose) => <TermsAndConditionsModal {...args} visible={visible} onClose={onClose} onAccept={onClose} />}</CommonDialogExample>
}`,...(s=(r=e.parameters)==null?void 0:r.docs)==null?void 0:s.source}}};const v=["Default"];export{e as Default,v as __namedExportsOrder,u as default};
