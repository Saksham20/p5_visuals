/*
Some conventions followed thorughout:
1. Translated: wrt to the specified center instead of the top left default.
2. Transformed: inbuilt (x,y,z) -> (y,z,x) : new: x going inside, y is width, z is height
Only during actual draw command, this is is transformed back using `transform_axes()`
 */

const dt=1
const my_vel = [0,0,-100]
var pos_list, center
const num_stars = 1000
const  spawn_plane_offset = 50
const z_stars = my_vel[2]<0 ? 3000 : 50
const radius_fixed = 20
var window_params
var camera_params = {'pos_sph':createVector(0, 90, 0), 'vel': 0}
const controller_params = {'rotate_scale': 5, 'vel_scale': 10} // degrees per key press

function create_window_params(w,h,offset,shape){
    /*
    All w,h,offset values are wrt inbuilt reference frame
     */
    return {'w': w,
            'h': h,
            'offset': offset,
            'shape': shape
            }
}

function rad_check(pos_id){//TODO: verify
    x = [pos_list[pos_id].x[0],pos_list[pos_id].x[1]]
    if (my_vel[2]<0){
        return (x[0]<0) || (x[0]>width) || (x[1]<0) || (x[1]>height) || (pos_list[pos_id].r>radius_fixed)
    } else{
        return math.norm(x)<50
    }
}

function pos_object(pos_vec){
    /*
    Makes JSON out of pos vector
    screen_pos: 2d y,z which can be directly translated into pixels. x is irrelevant.
    relative_pos: 3d relative to the camera position
    fixed_pos: the actual spawn 3d location, does not change!
    screen_rad: changes, fixed_rad: as spawned
     */
    let pos_vec_json = {
        'screen_pos':pos_vec,
        'relative_pos': pos_vec,//TODO: change via dim_shift
        'screen_rad':radius,
        'fixed_pos':pos_vec, //TODO
        'fixed_rad': random(20,40)
    }
    radius_alter(pos_vec_json)
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
            math.randomInt(width), math.randomInt(height), 0)//TODO check offset
        pos_vec = transform_axes(random_vec, type='to')
        let pos_now = pos_object(pos_vec)
        pos_list.push(pos_now)
        draw_now(pos_now, pos_now.rad)
    }
}


function re_initialize(pos_id, z_offset=z_stars){
    [x,y,z=math.randomInt(z_offset,z_offset*2)] = spawn_by_shape()
    pos_list[pos_id] = pos_object(createVector(x,y,z))
}

function setup(){
    createCanvas(1500,1000)
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
        draw_now(pos_list[no],pos_list[no].r)
        if (rad_check(no)){
            re_initialize(no)
        }
    }
}