import{j as t}from"./jsx-runtime-Cnbe3ryz.js";import{r as h}from"./index-3dRrDZpt.js";import{B as l,b as r,a as p}from"./index-Ct6YQRae.js";import{V as f}from"./index-DoLDgx4O.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const w={title:"Modals/Surfaces/BottomSheetModal",component:l,args:{visible:!1,onDismiss:()=>{}},parameters:{layout:"fullscreen",docs:{description:{component:"Use controlled `visible` when the sheet is part of app state or navigation. Use the imperative `ref` for local actions where callers only need to open or close the sheet."}}}};function b(){const[o,e]=h.useState(!1);return t.jsxs(f,{style:{gap:16},children:[t.jsx(r,{label:"Open bottom sheet",onPress:()=>e(!0)}),t.jsx(l,{visible:o,onDismiss:()=>e(!1),title:"Bottom Sheet",children:t.jsx(p,{children:"A bottom-aligned modal without drag gestures."})})]})}const s={parameters:{docs:{source:{code:`const [visible, setVisible] = useState(false);

<>
  <Button label="Open bottom sheet" onPress={() => setVisible(true)} />
  <BottomSheetModal
    visible={visible}
    onDismiss={() => setVisible(false)}
    title="Bottom Sheet"
  >
    <Text>A bottom-aligned modal without drag gestures.</Text>
  </BottomSheetModal>
</>`}}},render:()=>t.jsx(b,{})},n={parameters:{docs:{source:{code:`const modalRef = useRef<ModalHandle>(null);

<>
  <Button label="Open with ref" onPress={() => modalRef.current?.open()} />
  <Button label="Close with ref" onPress={() => modalRef.current?.close()} />
  <BottomSheetModal
    ref={modalRef}
    title="Imperative Sheet"
    onDismiss={() => modalRef.current?.close()}
  >
    <Text>Sheet content supplied by the host.</Text>
  </BottomSheetModal>
</>`}}},render:()=>{const o=h.useRef(null);return t.jsxs(f,{style:{gap:16},children:[t.jsx(r,{label:"Open with ref",onPress:()=>{var e;return(e=o.current)==null?void 0:e.open()}}),t.jsx(r,{label:"Close with ref",onPress:()=>{var e;return(e=o.current)==null?void 0:e.close()}}),t.jsx(l,{ref:o,title:"Imperative Sheet",onDismiss:()=>{var e;return(e=o.current)==null?void 0:e.close()},children:t.jsx(p,{children:"The host uses ModalHandle for a local bottom-sheet trigger without keeping `visible` in state."})})]})}};var a,i,m;s.parameters={...s.parameters,docs:{...(a=s.parameters)==null?void 0:a.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`const [visible, setVisible] = useState(false);

<>
  <Button label="Open bottom sheet" onPress={() => setVisible(true)} />
  <BottomSheetModal
    visible={visible}
    onDismiss={() => setVisible(false)}
    title="Bottom Sheet"
  >
    <Text>A bottom-aligned modal without drag gestures.</Text>
  </BottomSheetModal>
</>\`
      }
    }
  },
  render: () => <SheetExample />
}`,...(m=(i=s.parameters)==null?void 0:i.docs)==null?void 0:m.source}}};var d,c,u;n.parameters={...n.parameters,docs:{...(d=n.parameters)==null?void 0:d.docs,source:{originalSource:`{
  parameters: {
    docs: {
      source: {
        code: \`const modalRef = useRef<ModalHandle>(null);

<>
  <Button label="Open with ref" onPress={() => modalRef.current?.open()} />
  <Button label="Close with ref" onPress={() => modalRef.current?.close()} />
  <BottomSheetModal
    ref={modalRef}
    title="Imperative Sheet"
    onDismiss={() => modalRef.current?.close()}
  >
    <Text>Sheet content supplied by the host.</Text>
  </BottomSheetModal>
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
        <BottomSheetModal ref={modalRef} title="Imperative Sheet" onDismiss={() => modalRef.current?.close()}>
          <Text>The host uses ModalHandle for a local bottom-sheet trigger without keeping \`visible\` in state.</Text>
        </BottomSheetModal>
      </View>;
  }
}`,...(u=(c=n.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};const M=["Default","ImperativeRef"];export{s as Default,n as ImperativeRef,M as __namedExportsOrder,w as default};
