import React, {Component} from 'react';
import './inventory.scss'
import 'react-circular-progressbar/dist/styles.css';
import {IoIosArrowDown,IoIosArrowUp} from 'react-icons/all';
import NUI from "../../drivers/NUI";

var debug = false; // If true shows the position of the pointers that check the blocks

const _items = [
    {name : "Items 1", size_width : 2, size_height : 2},
    {name : "Items 2", size_width : 2, size_height : 2},
    {name : "Items 3", size_height : 1, size_height : 5},
]

class Inventory extends Component {
    state = {
        items : _items,
        grid : {width_block : 10, height_block : 10, size : 50} // size: px, block: amount
    }
    render() {
        const {items, grid} = this.state
        const {width_block, height_block, size} = grid
        return (
            <div className= "inventory-drag-wrapper" style = {
                    {
                        gridTemplateColumns : `repeat(${width_block}, ${size}px)`,
                        width : `${width_block * size + 3}px`,
                        height : `${height_block * size + 3}px`,
                        gridTemplateRows: `repeat(${width_block}, ${size}px)`,
                    }
                }>
                <InventoryBlock items = {items} amount = {width_block * height_block} size = {size}/>
            </div>
        )
    }
}

class InventoryBlock extends Component {
    
    state = {
        item_blocks : [...Array(this.props.amount)]
    }

    #createBox = ({x,y,size_height,size_width, size}) => {
        const box_elem = []
        for (var h = 1; h <= size_height; h++) { // X - Width / Y - Height
            for (var w = 1; w <= size_width; w++) {
                const coords = {x : 0, y : 0};
                coords.x = x + (w === 1 && 0.001 || (size * w - 20));
                coords.y = y + (h === 1 && 0.001 || (size * h - 20));
                const elem = this.#createElement({x : coords.x, y : coords.y})
                box_elem.push(elem)
            }
        }
        for (var i = 0; i < box_elem.length; i++) {
            box_elem[i].remove()
        }

    }

    #findEmptySlot = (data) => {
        const {item_blocks} = this.state
        let can_stop = true
    }

    #addItem = (id, data) => {
        const {item_blocks} = this.state
        if (item_blocks[id]) return;
        if (!id && id !== 0) return this.#findEmptySlot(data);
        item_blocks[id] = {
            name : data.name || "NOT NAME",
            description : data.description || "NOT DESCRIPTION",
            weight : data.weight || "NOT WEIGHT",
            size_width : data.size_width || 1,
            size_height : data.size_height || 1,
        }
        this.setState({item_blocks})
    }

    #removeItem = (id) => {
        const {item_blocks} = this.state
        item_blocks[id] = undefined
        this.setState({item_blocks})
    }

    #getBlockId = (elem) => {
        let id = elem.id.replace('block_item_',''); 
        return id;
    }

    #getItemBlockId = (elem) => {
        let id = elem.id.replace('item_block_','');
        return id;
    }

    #createElement = ({x,y}, item) => {
        const clone = document.createElement('div')
        clone.style.width = item && item.style.width || `20px`
        clone.style.height = item && item.style.height || `20px`
        clone.style.backgroundImage = item && item.style.backgroundImage || `url(https://cdn.discordapp.com/attachments/848589201683513344/924660342343237672/logo.png)`
        clone.style.backgroundPosition = 'center'
        clone.style.backgroundSize = 'contain'
        clone.style.boxSizing = 'border-box'
        clone.style.backgroundRepeat = 'no-repeat'
        clone.style.position = 'absolute'
        clone.style.backgroundColor = 'rgba(0,0,0,0.5)'
        clone.style.left = x + 'px'
        clone.style.top = y + 'px'
        clone.style.borderRadius = '2px'
        clone.style.zIndex = '9999'
        clone.style.pointerEvents = "none"
        clone.classList.add('clone-item')
        document.body.prepend(clone)
        return clone;
    }


    onDragStart = (e) => {
        if(e.button !== 0) return
        const item = e.target
        const id = this.#getItemBlockId(item) // Where
        const data = this.state.item_blocks[id] // data in args
        const {size} = this.props
        if(item && id && data) {


            const box_elem = []
            if (debug) {
                for (var i = 0; i < data.size_height + data.size_width; i++) {
                    const _elem = this.#createElement({x : 100, y : 100})
                    box_elem.push(_elem)
                }
            }



            const clone = this.#createElement({x : e.clientX, y : e.clientY}, item)
            this.#removeItem(id)
            let can_drop;

            const mouseMove = (e) => {
                let _coords, can_stop; // state and first coords
                const get_coords = []
                if(e.pageX > 0 && e.pageX < window.innerWidth - 60){
                    clone.style.left = e.pageX + 'px'
                }

                if(e.pageY > 0 && e.pageY < window.innerHeight - 60) {
                    clone.style.top = e.pageY + 'px'
                }


                const test = document.elementFromPoint(e.clientX, e.clientY)
                const rect = test.getBoundingClientRect()

                for (var h = 1; h <= data.size_height; h++) { // X - Width / Y - Height
                    for (var w = 1; w <= data.size_width; w++) {
                        const coords = {x : 0, y : 0};
                        let padding = 5
                        coords.x = rect.x + (w === 1 && padding || (size * w - 30));
                        coords.y = rect.y + (h === 1 && padding || (size * h - 30));
                        get_coords.push(coords)
                        if (!_coords) _coords = coords;
                        const elem = document.elementFromPoint(coords.x, coords.y)
                        if (elem && elem.className === "item-block" || elem.className !== "block" && elem.className !== "block-wrapper") {
                            can_stop = true
                            break;
                        }
                    }
                }

                if (debug) {
                    for (var i = 0; i < get_coords.length; i++) {
                        const elem = box_elem[i]
                        const coords = get_coords[i]
                        elem.style.left = coords.x + 'px'
                        elem.style.top = coords.y + 'px'
                    }
                }

                if (can_stop) clone.style.backgroundColor = "red"; // If you can't drag
                else clone.style.backgroundColor = "green"; //  If you can drag

                if (can_stop) return;

                const elem = document.elementFromPoint(_coords.x, _coords.y)
                if (elem) can_drop = elem;
            }
            const mouseUp = () => {
                clone.remove()
                document.removeEventListener('mousemove', mouseMove)
                document.removeEventListener('mouseup', mouseUp)

                if (debug) {
                    for (var i = 0; i < box_elem.length; i++) {
                        const elem = box_elem[i]
                        elem.remove()
                    }
                }


                const where_id = can_drop && this.#getBlockId(can_drop);
                if (where_id) this.#addItem(where_id, data);
                else this.#addItem(id, data);

                can_drop = false;
            }
            document.addEventListener('mousemove',mouseMove)
            document.addEventListener('mouseup', mouseUp)
        }
    }
    componentDidMount() {
        Object.entries(this.props.items).map((el,i) => {
            this.#addItem(i, el[1])
        })
        // this.#createBox({x : 100, y : 100, size_height : 2, size_width : 2, size : 50})
    }

    render() {
        const {item_blocks} = this.state
        const {size} = this.props
        return (
            item_blocks.map((v, i) => {
                return (
                    <div className = "block-wrapper" key = {i}>

                        {typeof(v) === "undefined" &&
                            <div className= 'block' id = {`block_item_${i}`}>

                            </div>
                        }
                        {typeof(v) !== "undefined" &&
                            <div className= 'item-block' id = {`item_block_${i}`} onMouseDown = {this.onDragStart} style = {
                                {
                                    backgroundImage : `url(https://cdn.discordapp.com/attachments/848589201683513344/924660342343237672/logo.png)`,
                                    width : size * v.size_width || 1,
                                    height: size * v.size_height || 1,
                                }
                            }>
                                {v.name}
                            </div>
                        }
                    </div>
                )
            })
        )
    }
}
export default Inventory;
