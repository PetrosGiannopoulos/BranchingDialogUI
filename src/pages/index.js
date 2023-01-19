import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import React, { useState, useRef, useCallback, useStore, memo, forwardRef } from 'react'
import { useEffect} from 'react'
import fs from 'fs-extra'
import axios from 'axios'
import { useRouter } from 'next/router'
import OutsideClickHandler from 'react-outside-click-handler';
import 'reactflow/dist/style.css';
import ReactFlow, { Background, Controls, Handle, Position, useNodesState, useEdgesState,addEdge,ReactFlowProvider,useReactFlow,useUpdateNodeInternals } from 'reactflow';

import { NodeResizer, NodeResizeControl } from '@reactflow/node-resizer';
import '@reactflow/node-resizer/dist/style.css';

const inter = Inter({ subsets: ['latin'] })


export default function Home() {


  const [addModal, setAddModal] = useState(false)
  const [numberOptions, setNumberOptions] = useState(0)
  // const [dialogueText, setDialogueText] = useState("")
  // const [dialogue, setDialogue] = useState({})
  // const [dialogues, setDialogues] = useState({})
  //const [nodeData, setNodeData] = useState({})
  //const [edgeData, setEdgeData] = useState({})
  //const [initialized, setInitialized] = useState(false)
  // const [id, setID] = useState(1)
  let reactFlowInstance;

  const dialogueDataRefs = {
    id: useRef(1),
    numberOptions: useRef(0),
    dialogue : useRef({}),
    dialogues: useRef({}),
    addModal: useRef(false),
    initialized: useRef(false),
    nodeData_: useRef({}),
    edgeData_: useRef({}),
  };
  

  if(!dialogueDataRefs.initialized.current){
    //dialogues.dialogues = [];
    dialogueDataRefs.dialogues.current.dialogues = [];
    dialogueDataRefs.nodeData_.current.position = [];
    dialogueDataRefs.nodeData_.current.nodes = [];
    dialogueDataRefs.edgeData_.current.edges = [];
    
  }

  // let dialogue = {}
  
  function DialogueDiv(){

    if(numberOptions==0)return;
    const divs = Array.from({ length: numberOptions }, (_, i) => 

    <div className="flex flex-col gap-5 my-4" key={i}>
      <span className="text-white text-[18px] font-lato">Option {i+1}</span>
      <textarea className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 font-changa rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your option here..."
        onChange={(event) => {
          dialogueDataRefs.dialogue.current.dialogueOptions[i].text = event.target.value
        }}
      />
      <input className="text-center w-16 p-2 rounded-sm"
      onChange={(event) => {
        if(event.target.value.match(/^\d+$/)===null){
          if(event.target.value.length>0){
            event.target.value = event.target.value.replace(/\D/g,'');
          }  
          else event.target.value = "";
            
        }
        else {
          let inputNumber = parseInt(event.target.value);
          event.target.value = inputNumber;
          
          if(event.target.value === "" || inputNumber === 0 || inputNumber === i){

          }
          else{
            dialogueDataRefs.dialogue.current.dialogueOptions[i].next = event.target.value
          }

        }
      }}
      />
    </div>
    
    );
    return <div className="flex-1 flex-col p-2 gap-5 bg-scroll overflow-auto bg-toolbarbg-3 rounded-lg">{divs}</div>;
  }

  const DialogueNodeMemo = React.memo(DialogueNode);

  const nodeTypes = {
    dialogue: DialogueNodeMemo,
  };

  function OptionNode({nodeId, handleId, text}){

    //console.log(`Node Id: ${nodeId}, HandleId: ${handleId}, Text: ${text}`)
    return (
      <div className="relative">
        <span className="font-changaOne text-[12px] text-white">{text}</span>
        <Handle type="source" position={Position.Right} id={handleId} className="bg-mainBg-6 rounded-full w-4 h-4 right-[-50px]" />
      </div>
    )
  }
  

  function DialogueNode({id, data}){

    const [isSelected, setIsSelected] = useState(true);
    const [size, setSize] = useState({x:data.size.x,y:data.size.y});
  
    const handleClickOutside = () => {
      setIsSelected(false);
      data.editMode = false;
    };
    
    const updateNodeInternals = useUpdateNodeInternals();

    const sizeRef = useRef(null);

    // useEffect(()=>{
    //   updateNodeInternals(id);
    // }, [id, updateNodeInternals])

    return (


      <div ref = {sizeRef}>
        <OutsideClickHandler onOutsideClick={handleClickOutside}>

        <NodeResizer
            
            onResize={(e)=>{
              //console.log(e.sourceEvent)
              //setSize({x: e.sourceEvent.target.offsetParent.clientWidth, y: e.sourceEvent.target.offsetParent.clientHeight});
              //updateNodeInternals(id);
              //console.log(sizeRef)
              //console.log(sizeRef)
              setSize({x: sizeRef.current.lastElementChild.offsetParent.clientWidth, y: sizeRef.current.lastElementChild.offsetParent.clientHeight})
            }}

            handleClassName="bg-mainBg-2 rounded-sm w-[8px] h-[8px]" 
            color="#000000" 
            isVisible={isSelected} 
            minWidth={80} 
            minHeight={50} 
            />

        
        <div style={{width: `${size.x}px`, height: `${size.y}px`}} className={'flex flex-col p-4 rounded-sm border-2 bg-toolbarbg-2 ' + `${isSelected ? 'border-white' : 'border-toolbarbg-1'}`} onClick={() => setIsSelected(!isSelected)}>

          

          {/* {console.log(size)} */}
          {!data.editMode ? (
            <div className="text-white text-[12px] font-changaOne overflow-auto text-center" onDoubleClick={() => { data.editMode = !data.editMode }}>{data.text}</div>
          ) : (
            <div>
              <textarea className="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 font-changa rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your dialogue here..."
                onChange={(event) => {
                  dialogueDataRefs.dialogues.current.dialogues[id - 1].text = event.target.value
                  data.text = event.target.value
                }}
              />
            </div>
          )}


          <div className="flex flex-col gap-2">

            {data.options != null ? Object.keys(data.selects).map((selectsInstance, handleId) => (
              <div key={handleId} className="rounded-lg p-2 w-[240px] border-black border-2 bg-toolbarbg-1">
                <OptionNode key={handleId} nodeId={id} handleId={selectsInstance} text={data.options[handleId].text} />
              </div>
            )) : (
              <div>
                <Handle type="source" position={Position.Right} className="bg-mainBg-6 rounded-full w-4 h-4 right-[-6px]" />
              </div>
            )}
          </div>

          <Handle type="target" position={Position.Left} className="bg-mainBg-4 rounded-full w-4 h-4 left-[-6px]" />

        </div>
        </OutsideClickHandler>
      </div>


    )
  }

  function PaneContextMenu({actions, position, isOpen}){

    
    return (
      isOpen?(
      <div className={`z-10 absolute flex flex-col bg-white border-4 border-toolbarbg-2`} style={{ left: `${position.x}px`, top: `${position.y}px` }} >
        {actions.map((action) => (
          <button key={action.label} className="border-none text-[18px] font-lato p-4 hover:bg-[rgba(0.1,0.1,0.1,0.1)]" onClick={action.effect}>
            {action.label}
          </button>
        ))}

      </div>):(<div></div>)
    )
  }
  

  function Flow(){

    const [nodes, setNodes, onNodesChange] = useNodesState(dialogueDataRefs.nodeData_.current.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(dialogueDataRefs.edgeData_.current.edges);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

    const [paneContextMenuPosition, setPaneContextMenuPosition] = useState({x:0, y:0})
    const [paneContentMenuIsOpen, setPaneContentMenuIsOpen] = useState(false)

    reactFlowInstance = useReactFlow();

    const reactFlowRef = useRef(null)

    // const size = useStore((s) => {
    //   const node = s.nodeInternals.get(id);
    
    //   return {
    //     width: node.width,
    //     height: node.height,
    //   };
    // });

    return (
      <div className="flex flex-row w-full">
        <ReactFlow 

          ref={reactFlowRef}

          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}

          // defaultNodes={dialogueDataRefs.nodeData_.current.nodes}
          onPaneContextMenu={(e)=>{
            e.preventDefault();

            const position = {
               x: e.clientX - 400,
               y: e.clientY - 100
            };


            setPaneContextMenuPosition({x: position.x, y: position.y});
            setPaneContentMenuIsOpen(true);
          }}
          onPaneClick={()=>{
            setPaneContentMenuIsOpen(false);
          }}
          nodeTypes={nodeTypes}
          onConnect={onConnect}

         
          >
          <PaneContextMenu

            actions={
              [
                { label: "Add Dialogue Node", effect: ()=>
                  {
                    
                    const bounds = reactFlowRef.current.getBoundingClientRect();
                    const position = reactFlowInstance.project({
                       x: paneContextMenuPosition.x-128,
                       y: paneContextMenuPosition.y
                    });
                    reactFlowInstance.addNodes(AddNode({x_: position.x, y_: position.y}))
                    setPaneContentMenuIsOpen(false)
                    
                  } 
                },
                { label: "Cancel", effect: ()=>{
                    setPaneContentMenuIsOpen(false)
                } },
              ]
            }

            position={paneContextMenuPosition}

            isOpen={paneContentMenuIsOpen}
          />
          
          <Background />
          <Controls />
        </ReactFlow>
        
      </div>
    );
  }

  const openAddModal = async() =>{
    setAddModal(true);

    setDialogue({})

    setNumberOptions(0)
    
  }

  const closeAddModal = async()=>{
    setAddModal(false)
  }

  function AddNode({x_, y_}){

    //setDialogue({})

    //setNumberOptions(0)

    //setAddModal(false);
    //setInitialized(true);
    dialogueDataRefs.dialogue.current = {};
    dialogueDataRefs.numberOptions.current = 0;
    dialogueDataRefs.addModal.current = false;
    dialogueDataRefs.initialized.current = true;
    //dialogue.id = ""+id;
    
    //dialogue.text = ""+dialogueText;

    dialogueDataRefs.dialogue.current = {...dialogueDataRefs.dialogue.current, id: ''+dialogueDataRefs.id.current, text: " --- Add Text ---", next: ''};

    
    const node = {
      id: dialogueDataRefs.dialogue.current.id,
      type: 'dialogue',
      data: {
        text: dialogueDataRefs.dialogue.current.text, 
        options: dialogueDataRefs.dialogue.current.dialogueOptions,
        selects: {
          
        },
        editMode: false,
        size: {x: 200, y: 100},
      },
      position: {x: x_, y: y_}
    }

    dialogueDataRefs.id.current++;
    //setID(id+1)
    dialogueDataRefs.dialogues.current.dialogues.push(dialogueDataRefs.dialogue.current);
    //nodeData.nodes.push(node);
    dialogueDataRefs.nodeData_.current.nodes.push(node);
    
    
    return node;
  }

  const OKButton = async()=>{
    setAddModal(false);
    setInitialized(true);

    dialogue.id = ""+id;
    
    dialogue.text = ""+dialogueText;
    
    //console.log(JSON.stringify(dialogues, null, 2));
    // nodeData.position.push({x: 0, y: 0})
    const node = {
      id: dialogue.id,
      type: 'dialogue',
      data: {
        text: dialogue.text, 
        options: dialogue.dialogueOptions,
        selects: {
          
        }
      },
      //position: {x: (256+10)*dialogue.id, y: 40},
      position: {x: paneContextMenuPosition.x, y: paneContextMenuPosition.y}
    }

    if(dialogue.dialogueOptions!=null){
      node.data.selects = {}
      for(let i=0;i<dialogue.dialogueOptions.length;i++){
        assign(node.data.selects, 'handle-'+`${i}`, 'default')

        if(dialogue.dialogueOptions[i].next==="" || dialogue.dialogueOptions[i].next === null){
          window.alert('Every option needs to have a next parameter');

          return;
        }

        const edge = {
          type: 'default',
          data: {
            
          }
        }


        edge.id = `e${dialogue.id}-${dialogue.dialogueOptions[i].next}`
        edge.source = `${dialogue.id}`
        edge.target = `${dialogue.dialogueOptions[i].next}`

        edge.data.selectIndex = i
        edge.sourceHandle = 'handle-'+`${i}`
        // console.log(edge)
        edgeData.edges.push(edge)
      }
      
      
    }
    else{

      const edge = {
        type: 'default',
        data: {
          
        }
      }

      edge.id = `e${dialogue.id}-${id}`
      edge.source = `${dialogue.id}`
      edge.target = `${id+1}`
      edgeData.edges.push(edge)
      
    }

    setID(id+1)
    dialogues.dialogues.push(dialogue);

    nodeData.nodes.push(node);
    // edgeData.edges.push(edge)

  }

  function assign(obj, prop, value) {
    if (typeof prop === "string")
        prop = prop.split(".");

    if (prop.length > 1) {
        var e = prop.shift();
        assign(obj[e] =
                 Object.prototype.toString.call(obj[e]) === "[object Object]"
                 ? obj[e]
                 : {},
               prop,
               value);
    } else
        obj[prop[0]] = value;
  }

  const CancelButton = async()=>{
    setAddModal(false);
  }

  const saveDialogues = async ()=>{
    
    downloadFile()
  }

  async function downloadFile() {
    try {
      
      const blob = new Blob([JSON.stringify(dialogueDataRefs.dialogues.current, null, 2)], {type: "application/json"});//await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'character.json');
      document.body.appendChild(link);
      link.click();
      // setMessage('File downloaded successfully');
    } catch (error) {
      console.error(error);
    }
  }
  
  
  return (
    <>
      <Head>
        <title>Branching Dialogues UI</title>
        <meta name="description" content="Branching Dialogues UI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-mainBg-1">
        <div className="flex flex-row bg-gradient-to-b from-mainBg-1 via-mainBg-2 to-mainBg-1 min-h-screen max-md:min-w-max max-md:w-full">
          
          {/* Toolbar */}
          <div></div>
          {/* User Interface */}
          <div className="flex flex-row bg-toolbarbg-1 rounded-xl shadow-lg w-[410px] h-[576px] mt-[100px] ml-[100px]">
            {/* UI Buttons */}

            <div className="flex flex-col bg-toolbarbg-3 ml-4 mt-4 gap-2 p-2">

              {/* <div className="flex flex-row min-h-max items-start gap-5">

                Add button
                <button className="rounded-lg border-none bg-toolbarbg-1 font-lato text-white bg-gradient-to-t from-orange-800 via-orange-300 to-orange-500 text-[18px] text-center items-center cursor-pointer w-[170px] h-[56px]" onClick={openAddModal}>
                  <span className="rounded-lg px-[60px] py-[12px] text-center items-center bg-toolbarbg-3 text-orange-50 hover:bg-transparent transition ease-out duration-75 hover:text-toolbarbg-2">ADD</span>
                </button>
                
                Option button
                <button className="rounded-lg border-none bg-toolbarbg-1 font-lato text-white bg-gradient-to-t from-blue-800 via-blue-300 to-blue-500 text-[18px] text-center items-center cursor-pointer w-[170px] h-[56px]">
                  <span className="rounded-lg px-[60px] py-[12px] text-center items-center bg-toolbarbg-3 text-orange-50 hover:bg-transparent transition ease-out duration-75 hover:text-toolbarbg-2">EDIT</span>
                </button>
              </div> */}

              <div className="flex flex-row min-h-max items-start gap-5">
                {/* SAVE BUTTON */}
                <button className="rounded-lg border-none bg-toolbarbg-1 font-lato text-white bg-gradient-to-t from-lime-800 via-lime-300 to-lime-500 text-[18px] text-center items-center cursor-pointer w-[170px] h-[56px]" onClick={saveDialogues}>
                  <span className="rounded-lg px-[60px] py-[12px] text-center items-center bg-toolbarbg-3 text-orange-50 hover:bg-transparent transition ease-out duration-75 hover:text-toolbarbg-2">SAVE</span>
                </button>
              </div>
            </div>

            {/* Dialogue UI */}
            {/* <DialoguePreviewDiv>

            </DialoguePreviewDiv> */}
            
            {addModal? (
              <React.Fragment>
                <div className="absolute w-[1024px] h-[576px] bg-toolbarbg-1 rounded-xl shadow-lg p-8">
                  <div className="flex flex-col gap-4">
                    <span className="text-white text-[18px] font-lato">Dialogue Text Area</span>
                    <textarea rows="4" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 font-changa rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your dialogue here..." onChange={(e)=>setDialogueText(e.target.value)}/>
                    <span className="text-white text-[18px] font-lato">Options</span>
                    
                    <div className="flex flex-row gap-4 h-[250px] w-full">
                        <div className="flex flex-col gap-2 w-[160px]">
                          <span className="text-white text-[18px] font-lato">Number of Options</span>
                          <input className="text-center w-16 p-2 rounded-sm" placeholder=""
                          onChange={(event) => {
                            if(event.target.value.match(/^\d+$/)===null){
                              if(event.target.value.length>0){
                                event.target.value = event.target.value.replace(/\D/g,'');
                              }  
                              else event.target.value = "";
                                
                            }
                            else {
                              let inputNumber = parseInt(event.target.value);
                              event.target.value = inputNumber;
                            }

                            if(event.target.value === ""){
                              setNumberOptions(0)

                              dialogueDataRefs.id.current = ""
                              dialogueDataRefs.dialogue.current.text = ""
                              dialogueDataRefs.dialogue.current.dialogueOptions = []
                              
                            }
                            else {
                              const numOptions = parseInt(event.target.value)
                              setNumberOptions(numOptions)
                              
                              dialogueDataRefs.id.current = ""
                              dialogueDataRefs.dialogue.current.text = ""
                              dialogueDataRefs.dialogue.current.dialogueOptions = []
                              
                              for (let i = 0; i < numOptions; i++) {

                                const optionTemp = {
                                  "text" : "",
                                  "next" : "" 
                                }
                                dialogueDataRefs.dialogue.current.dialogueOptions.push(optionTemp)
                                
                              }
                              //console.log(JSON.stringify(dialogue, null, 2))
                            }
                          }}
                          
                          />
                        </div>
                        <DialogueDiv />
                    </div>

                    
                    
                    <div className="flex flex-row gap-2">
                      <button className="font-changaOne text-[18px] text-toolbarbg-1 rounded-lg border-toolbarbg-1 border-2 p-2 bg-white" onClick={OKButton}>OK</button>
                      <button className="font-changaOne text-[18px] text-toolbarbg-1 rounded-lg border-toolbarbg-1 border-2 p-2 bg-white" onClick={CancelButton}>CANCEL</button>
                    </div>
                  </div>
                </div>

                

              </React.Fragment>
            ): (
              <div>
                
              </div>
            )}
            
          </div>
          
          {addModal? (
            <div></div>
          ):(
            <div className="flex flex-row bg-toolbarbg-3 w-full h-[800px] mt-[100px] ml-[20px]">
              {/* Node System */}
              <ReactFlowProvider>
                <Flow />
              </ReactFlowProvider>
              
            </div>
            
          )}
          
          

        </div>        
      </main>
    </>
  )
}
