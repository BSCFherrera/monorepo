import{j as e}from"./jsx-runtime-Cnbe3ryz.js";import{r as n}from"./index-Ct6YQRae.js";import{V as y}from"./index-DoLDgx4O.js";import"./index-3dRrDZpt.js";import"./index-a733mUB5.js";import"./index-DKTdOcjh.js";const T={title:"Conversation/MessageBubble",component:n,args:{children:"How can I help you today?",direction:"incoming"}},a={},r={args:{direction:"outgoing",children:"Show me the available options."}},s={args:{timestampLabel:"10:00 AM"}},o={args:{children:"Your **account balance** is $1,500.00"}},t={render:()=>e.jsxs(y,{style:{gap:4},children:[e.jsx(n,{timestampLabel:"10:00",children:"How can I help you?"}),e.jsx(n,{direction:"outgoing",timestampLabel:"10:01",children:"Show me the available options."}),e.jsx(n,{timestampLabel:"10:02",children:"Here are your **current options** for assistance."})]})};var i,c,m;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:"{}",...(m=(c=a.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var p,l,u;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    direction: 'outgoing',
    children: 'Show me the available options.'
  }
}`,...(u=(l=r.parameters)==null?void 0:l.docs)==null?void 0:u.source}}};var d,g,b;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    timestampLabel: '10:00 AM'
  }
}`,...(b=(g=s.parameters)==null?void 0:g.docs)==null?void 0:b.source}}};var h,w,x;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    children: 'Your **account balance** is $1,500.00'
  }
}`,...(x=(w=o.parameters)==null?void 0:w.docs)==null?void 0:x.source}}};var B,M,S;t.parameters={...t.parameters,docs:{...(B=t.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <View style={{
    gap: 4
  }}>
      <MessageBubble timestampLabel="10:00">How can I help you?</MessageBubble>
      <MessageBubble direction="outgoing" timestampLabel="10:01">Show me the available options.</MessageBubble>
      <MessageBubble timestampLabel="10:02">Here are your **current options** for assistance.</MessageBubble>
    </View>
}`,...(S=(M=t.parameters)==null?void 0:M.docs)==null?void 0:S.source}}};const V=["Incoming","Outgoing","WithTimestamp","BoldText","Conversation"];export{o as BoldText,t as Conversation,a as Incoming,r as Outgoing,s as WithTimestamp,V as __namedExportsOrder,T as default};
