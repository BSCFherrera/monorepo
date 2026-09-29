import{j as s}from"./jsx-runtime-Cnbe3ryz.js";import{r}from"./index-3dRrDZpt.js";import{e as i,b as t,a as d}from"./index-Ct6YQRae.js";import{V as c}from"./index-DoLDgx4O.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const j={title:"Modals/Surfaces/CenteredModal",component:i,args:{visible:!1,onDismiss:()=>{}},parameters:{layout:"fullscreen",docs:{description:{component:"Use controlled `visible` when application state owns the modal lifecycle, for example navigation, persisted flows, or analytics. Use the imperative `ref` for local UI triggers such as “open details”, demos, and escape hatches where the parent does not need to store visibility."}}}};function M(){const[n,e]=r.useState(!1);return s.jsxs(c,{style:{gap:16},children:[s.jsx(t,{label:"Open centered modal",onPress:()=>e(!0)}),s.jsx(i,{visible:n,onDismiss:()=>e(!1),title:"Example Dialog",children:s.jsx(d,{children:"Centered content supplied by the host."})})]})}const o={parameters:{docs:{source:{code:`const [visible, setVisible] = useState(false);

<>
  <Button label="Open centered modal" onPress={() => setVisible(true)} />
  <CenteredModal
    visible={visible}
    onDismiss={() => setVisible(false)}
    title="Example Dialog"
  >
    <Text>Centered content supplied by the host.</Text>
  </CenteredModal>
</>`}}},render:()=>s.jsx(M,{})},l={parameters:{docs:{source:{code:`const modalRef = useRef<ModalHandle>(null);

<>
  <Button label="Open with ref" onPress={() => modalRef.current?.open()} />
  <Button label="Close with ref" onPress={() => modalRef.current?.close()} />
  <CenteredModal
    ref={modalRef}
    title="Imperative Dialog"
    onDismiss={() => modalRef.current?.close()}
  >
    <Text>Modal content supplied by the host.</Text>
  </CenteredModal>
</>`}}},render:()=>{const n=r.useRef(null);return s.jsxs(c,{style:{gap:16},children:[s.jsx(t,{label:"Open with ref",onPress:()=>{var e;return(e=n.current)==null?void 0:e.open()}}),s.jsx(t,{label:"Close with ref",onPress:()=>{var e;return(e=n.current)==null?void 0:e.close()}}),s.jsx(i,{ref:n,title:"Imperative Dialog",onDismiss:()=>{var e;return(e=n.current)==null?void 0:e.close()},children:s.jsx(d,{children:"The host uses ModalHandle.open() and ModalHandle.close() instead of storing `visible` state."})})]})}},a={parameters:{docs:{source:{code:`<CenteredModal
  visible={visible}
  onDismiss={handleClose}
  canDismiss={false}
  title="Confirm action"
>
  <Text>This modal cannot be dismissed by tapping outside.</Text>
  <Button label="Close" onPress={handleClose} />
</CenteredModal>`}}},render:()=>{const[n,e]=r.useState(!1);return s.jsxs(c,{style:{gap:16},children:[s.jsx(t,{label:"Open non-dismissable",onPress:()=>e(!0)}),s.jsxs(i,{visible:n,onDismiss:()=>e(!1),canDismiss:!1,title:"Confirm action",children:[s.jsx(d,{children:"This modal cannot be dismissed by tapping outside."}),s.jsx(t,{label:"Close",onPress:()=>e(!1)})]})]})}};var m,p,u;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`const [visible, setVisible] = useState(false);

<>
  <Button label="Open centered modal" onPress={() => setVisible(true)} />
  <CenteredModal
    visible={visible}
    onDismiss={() => setVisible(false)}
    title="Example Dialog"
  >
    <Text>Centered content supplied by the host.</Text>
  </CenteredModal>
</>\`
      }
    }
  },
  render: () => <CenteredExample />
}`,...(u=(p=o.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var f,b,h;l.parameters={...l.parameters,docs:{...(f=l.parameters)==null?void 0:f.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`const modalRef = useRef<ModalHandle>(null);

<>
  <Button label="Open with ref" onPress={() => modalRef.current?.open()} />
  <Button label="Close with ref" onPress={() => modalRef.current?.close()} />
  <CenteredModal
    ref={modalRef}
    title="Imperative Dialog"
    onDismiss={() => modalRef.current?.close()}
  >
    <Text>Modal content supplied by the host.</Text>
  </CenteredModal>
</>\`
      }
    }
  },
  render: () => {
    const modalRef = useRef<ModalHandle>(null);
    return <View style={{
      gap: 16
    }}>
        <Button label="Open with ref" onPress={() => modalRef.current?.open()} />
        <Button label="Close with ref" onPress={() => modalRef.current?.close()} />
        <CenteredModal ref={modalRef} title="Imperative Dialog" onDismiss={() => modalRef.current?.close()}>
          <Text>The host uses ModalHandle.open() and ModalHandle.close() instead of storing \`visible\` state.</Text>
        </CenteredModal>
      </View>;
  }
}`,...(h=(b=l.parameters)==null?void 0:b.docs)==null?void 0:h.source}}};var x,C,v;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`<CenteredModal
  visible={visible}
  onDismiss={handleClose}
  canDismiss={false}
  title="Confirm action"
>
  <Text>This modal cannot be dismissed by tapping outside.</Text>
  <Button label="Close" onPress={handleClose} />
</CenteredModal>\`
      }
    }
  },
  render: () => {
    const [visible, setVisible] = useState(false);
    return <View style={{
      gap: 16
    }}>
        <Button label="Open non-dismissable" onPress={() => setVisible(true)} />
        <CenteredModal visible={visible} onDismiss={() => setVisible(false)} canDismiss={false} title="Confirm action">
          <Text>This modal cannot be dismissed by tapping outside.</Text>
          <Button label="Close" onPress={() => setVisible(false)} />
        </CenteredModal>
      </View>;
  }
}`,...(v=(C=a.parameters)==null?void 0:C.docs)==null?void 0:v.source}}};const w=["Default","ImperativeRef","NonDismissable"];export{o as Default,l as ImperativeRef,a as NonDismissable,w as __namedExportsOrder,j as default};
