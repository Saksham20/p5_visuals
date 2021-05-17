/*
Some conventions followed thorughout:
1. Translated: wrt to the specified center instead of the top left default.
2. Transformed: inbuilt (x,y,z) -> (y,z,x) : new: x going inside, y is width, z is height
Only during actual draw command, this is is transformed back using `transform_axes()`
 */

const dt=1
var pos_list, center
const radius_limit = 50
const num_stars = 1000
const object_x_params = {'start': 100, 'end': 3000} //where the objects spawn wrt the window
var window_params
var camera_params
const controller_params = {'rotate_scale': 5, 'vel_scale': 10} // degrees per key press

function create_window_params(w,h,offset,shape){
    /*
    w: width of the window
    h: height of window
    offset: values in pixels the observer is 'outside' the screen
    shape: 'ellipse', 'rect', 'circle'
     */
    return {'w': w,
            'h': h,
            'offset': offset,
            'shape': shape
            }
}

function rad_reset(pos_id){
    screen_pos = transform_axes(pos_list[pos_id].screen_pos, type='from')
    if (camera_params.vel<0){
        return (screen_pos.x<0) || (screen_pos.x>width) ||
            (screen_pos.y<0) || (screen_pos.y>height) || (pos_list[pos_id].screen_rad>radius_limit)
    } else {
        return pos_list[pos_id].screen_rad<10
    }
}

function pos_object(pos_vec,
                    x_3d_coord=random(object_x_params.start, object_x_params.end)){
    /*
    Makes JSON out of pos vector
    screen_pos: 2d y,z which can be directly translated into pixels. x is irrelevant.
    relative_pos: 3d relative to the camera position
    fixed_pos: the actual spawn 3d location, does not change!
    screen_rad: changes, fixed_rad: as spawned
     */
    rad_random = random(20,40)
    let pos_vec_json = {
        'screen_pos':pos_vec,
        'relative_pos': pos_vec,
        'screen_rad':rad_random,
        'fixed_pos':pos_vec,
        'fixed_rad': rad_random
    }
    radius_alter(pos_vec_json)
    dim_shift(pos_vec_json,
        type = 'to_3d',
        x_3d_coord=x_3d_coord,
        initialize=true)
    return pos_vec_json
}

function transform_axes(pos_vec,type='to'){
    /*
    This function transforms and translates to the new frame and set of
    defined axes.
    pos_vec: p5.Vector type
    to: inbuilt > new type
    from: new type > inbuilt
     */
    if (type==='to'){
        rel_pos_vec = pos_vec.sub(...center)
        return createVector(rel_pos_vec.z,rel_pos_vec.x,rel_pos_vec.y)}
    else if (type==='from'){
        transformed_vec = createVector(pos_vec.y,pos_vec.z,pos_vec.x)
        return transformed_vec.add(...center)}
}

//controller input:
function keyPressed() {
  if (keyCode === LEFT_ARROW) {
        camera_params.pos_sph.x -= controller_params.rotate_scale
  } else if (keyCode === RIGHT_ARROW) {
        camera_params.pos_sph.x += controller_params.rotate_scale
  } else if (keyCode === UP_ARROW){
        camera_params.pos_sph.y += controller_params.rotate_scale
  } else if (keyCode === DOWN_ARROW){
        camera_params.pos_sph.y -= controller_params.rotate_scale
  } else if (key === 'w'){
        camera_params.vel += controller_params.vel_scale
  } else if (key === 's'){
        camera_params.vel -= controller_params.vel_scale
  }
}

function draw_now(pos_json,w,h=w){
    /*
    Note: will reverse the transform and translation wrt center
    pos: the position JSON
     */
    fill(255);
    pos_abs = transform_axes(pos_json.screen_pos,'from')
    ellipse(pos_abs.x,pos_abs.y,w,h)
}

function initialize_objects(){
    /*
    Initialize objects only during the start.
    Randomize, translate, transform and create pos class.
     */
    for (let i=0;i<num_stars;i++){
        random_vec = createVector(
            math.randomInt(width), math.randomInt(height), 0)
        pos_vec = transform_axes(random_vec, type='to')
        let pos_now = pos_object(pos_vec)
        pos_list.push(pos_now)
        draw_now(pos_now, pos_now.rad)
    }
}


function re_initialize(pos_id){
    pos_list[pos_id] = pos_object(spawn_by_shape())
}

function setup(){
    createCanvas(1500,1000)
    camera_params = {'pos_sph':createVector(0, 90, 0), 'vel': 0}
    window_params = create_window_params(0.8*width,0.8*height,50,'ellipse')
    pos_list = []
    center = [width/2,height/2,0]
    background(0)
    initialize_objects()
}

function draw(){
    background(0);
    camera_params.pos_sph.z += camera_params.vel*dt
    for (let no=0;no<pos_list.length;no++){
        travel(pos_list[no])
        draw_now(pos_list[no],pos_list[no].screen_rad)
        if (rad_reset(no)){
            re_initialize(no)
        }
    }
}