import {makeProject} from '@motion-canvas/core';
import jobFlow from './scenes/jobFlow?scene';
import backfill from './scenes/backfill?scene';
import pfs from './scenes/pfs?scene';
import steps from './scenes/steps?scene';
import components from './scenes/components?scene';
import treeWidth from './scenes/treeWidth?scene';
import failover from './scenes/failover?scene';

/**
 * Cluster 與 Slurm 兩份簡報的動畫。播放頁用 ?scene=名稱 播單一場景，
 * 投影片以 <MotionCanvas scene="名稱"> 嵌入。
 *
 * Introduction to Cluster：pfs、backfill、jobFlow、steps
 * Building and Installing Slurm：components、treeWidth、failover
 */
export default makeProject({
  scenes: [pfs, backfill, jobFlow, steps, components, treeWidth, failover],
});
